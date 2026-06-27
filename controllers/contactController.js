// server/controllers/contactController.js
import sendContactEmail from "../services/emailService.js";

/**
 * Handles contact form submissions.
 * Expects JSON body: { firstName, lastName, email, country, subject, description }
 */
export async function sendContactMessage(req, res) {
  try {
    const { firstName, lastName, email, country, subject, description } = req.body || {};

    if (!firstName || !lastName || !email || !country || !subject || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const fullName = (firstName.trim() + " " + lastName.trim());

    const result = await sendContactEmail({
      fullName,
      email: email.trim(),
      country,
      subject: subject.trim(),
      message: description.trim().replace(/\n/g, "<br/>"),
    });

    if (!result.success) {
      console.error("Email failed:", result.message);
      return res.status(500).json({ error: "Failed to send email" });
    }

    return res.json({ message: "Contact email sent successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}


