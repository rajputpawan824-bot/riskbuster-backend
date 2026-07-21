import { User } from "../models/User.js";

export async function recordDownload(req, res) {
  try {
    const email = req.user?.email;
    if (!email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { documentType, documentId, title, fileLink } = req.body || {};
    if (!documentType || !fileLink) {
      return res.status(400).json({ error: "documentType and fileLink are required" });
    }

    const user = await User.findOneAndUpdate(
      { email: String(email).toLowerCase() },
      {
        $push: {
          download_document: {
            documentType: String(documentType).trim(),
            documentId: documentId != null ? String(documentId).trim() : "",
            title: title != null ? String(title).trim() : "",
            fileLink: String(fileLink).trim(),
            downloadedAt: new Date(),
          },
        },
      },
      { new: true }
    ).exec();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(201).json({
      ok: true,
      downloads: user.download_document?.length ?? 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to record download" });
  }
}
