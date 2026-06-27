// server/services/emailService.js
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve logo path at startup
const logoPath = path.join(__dirname, "..", "assets", "logo.png");
let logoExists = false;
try {
  fs.accessSync(logoPath, fs.constants.R_OK);
  logoExists = true;
  console.log("✅ Logo found at", logoPath);
} catch (e) {
  console.warn("⚠️ Logo not found – emails will be sent without a logo.");
}

/**
 * Sends a styled contact-form email using SMTP credentials from .env
 */
export default async function sendContactEmail({
  fullName,
  email,
  country,
  subject,
  message,
}) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const year = new Date().getFullYear();

    // Header content: Show only the logo image banner if it exists, otherwise fall back to styled text
    const headerTdStyle = logoExists
      ? 'background:#08264d;padding:0;text-align:center;'
      : 'background:#08264d;padding:30px;text-align:center;';

    const headerContent = logoExists
      ? '<img src="cid:riskbusters_logo" alt="RiskBusters" style="width:100%;max-width:650px;height:auto;display:block;margin:0 auto;" />'
      : '<h1 style="margin:0;color:#fff;font-size:32px;">RiskBusters</h1>' +
        '<p style="margin-top:10px;color:#d6e7ff;font-size:14px;">Analyzing Threats, Identifying Risks and Mitigation</p>';

    const html = "<!DOCTYPE html>" +
      '<html lang="en">' +
      "<head>" +
      '<meta charset="UTF-8">' +
      "<title>RiskBusters Contact Request</title>" +
      "</head>" +
      '<body style="margin:0;padding:40px 0;background:#f3f6fb;font-family:Arial,Helvetica,sans-serif;">' +
      '<table width="100%" cellpadding="0" cellspacing="0">' +
      "<tr>" +
      '<td align="center">' +
      '<table width="650" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08);">' +

      // Header
      "<tr>" +
      '<td style="' + headerTdStyle + '">' +
      headerContent +
      "</td>" +
      "</tr>" +

      // Title
      "<tr>" +
      '<td style="padding:35px 40px 15px;">' +
      '<h2 style="margin:0;color:#08264d;">\u{1F4E9} New Contact Request</h2>' +
      '<p style="color:#666;font-size:15px;line-height:25px;">A new contact request has been submitted from the RiskBusters website.</p>' +
      "</td>" +
      "</tr>" +

      // Data table
      "<tr>" +
      '<td style="padding:0 40px 30px;">' +
      '<table width="100%" cellpadding="0" cellspacing="0">' +

      // Full Name
      "<tr>" +
      '<td style="padding:18px;background:#f8fafc;border-bottom:1px solid #edf2f7;width:180px;font-weight:bold;color:#08264d;">\u{1F464} Full Name</td>' +
      '<td style="padding:18px;border-bottom:1px solid #edf2f7;">' + fullName + "</td>" +
      "</tr>" +

      // Email
      "<tr>" +
      '<td style="padding:18px;background:#f8fafc;border-bottom:1px solid #edf2f7;font-weight:bold;color:#08264d;">\u{1F4E7} Email Address</td>' +
      '<td style="padding:18px;border-bottom:1px solid #edf2f7;"><a href="mailto:' + email + '" style="color:#0d6efd;text-decoration:none;">' + email + "</a></td>" +
      "</tr>" +

      // Country
      "<tr>" +
      '<td style="padding:18px;background:#f8fafc;border-bottom:1px solid #edf2f7;font-weight:bold;color:#08264d;">\u{1F30D} Country</td>' +
      '<td style="padding:18px;border-bottom:1px solid #edf2f7;">' + country + "</td>" +
      "</tr>" +

      // Subject
      "<tr>" +
      '<td style="padding:18px;background:#f8fafc;border-bottom:1px solid #edf2f7;font-weight:bold;color:#08264d;">\u{1F4DD} Subject</td>' +
      '<td style="padding:18px;border-bottom:1px solid #edf2f7;">' + subject + "</td>" +
      "</tr>" +

      // Message
      "<tr>" +
      '<td style="padding:18px;background:#f8fafc;font-weight:bold;color:#08264d;vertical-align:top;">\u{1F4AC} Message</td>' +
      '<td style="padding:18px;line-height:28px;">' + message + "</td>" +
      "</tr>" +

      "</table>" +
      "</td>" +
      "</tr>" +

      // Footer
      "<tr>" +
      '<td style="padding:25px;background:#08264d;text-align:center;">' +
      '<p style="margin:0;color:#ffffff;font-size:14px;">\u00A9 ' + year + " RiskBusters</p>" +
      '<p style="margin-top:8px;color:#bcd0eb;font-size:13px;">Security Threat &amp; Risk Management Platform</p>' +
      "</td>" +
      "</tr>" +

      "</table>" +
      "</td>" +
      "</tr>" +
      "</table>" +
      "</body>" +
      "</html>";

    // Build attachments array (CID-embedded logo)
    const attachments = [];
    if (logoExists) {
      attachments.push({
        filename: "logo.png",
        path: logoPath,
        cid: "riskbusters_logo", // must match the cid in the img src
      });
    }

    const info = await transporter.sendMail({
      from: '"RiskBusters Contact Form" <' + process.env.SMTP_USER + ">",
      to: process.env.CONTACT_RECEIVER_EMAIL,
      replyTo: email,
      subject: "New Contact Request - " + subject,
      html,
      attachments,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: error.message,
    };
  }
}
