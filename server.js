require("dotenv").config(); // Load environment variables from .env
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" })); // Increased payload size limit
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Email sending route
app.post("/send-email", async (req, res) => {
  const { user_name, user_email, user_contact, message, attachment } = req.body;

  // Validate required fields
  if (!user_name || !user_email || !user_contact || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Decode base64 attachment if provided
    let attachments = [];
    if (attachment) {
      const [meta, base64Data] = attachment.split(",");
      const mimeType = meta.split(";")[0].split(":")[1];
      attachments.push({
        filename: `attachment.${mimeType.split("/")[1]}`,
        content: Buffer.from(base64Data, "base64"),
        contentType: mimeType,
      });
    }

    // Create a transporter object using environment variables for sensitive information
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER, // Use environment variable for the email
        pass: process.env.EMAIL_PASS, // Use environment variable for the email password
      },
    });

    // Email to the recipient
    const mailOptions = {
      from: `"NR Choksi" <${user_email}>`, // Use environment variable
      to: process.env.EMAIL_USER,
      subject: "Contact Form Details",
      text: message,
      html: `<p><b>Name:</b> ${user_name}</p>
             <p><b>Email:</b> ${user_email}</p>
             <p><b>Contact:</b> ${user_contact}</p>
             <p><b>Message:</b> ${message}</p>`,
      attachments,
    };

    // Send the primary email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);

    // Auto-reply email to the sender
    const autoReplyOptions = {
      from: `"NR Choksi" <${process.env.EMAIL_USER}>`,
      to: user_email,
      subject: "Thank You for Contacting Us!",
      text: `Dear ${user_email},\n\nThank you for reaching out to us. We have received your message and will get back to you shortly.\n\nBest regards,\nNR Choksi Team`,
      html: `<p>Dear ${user_email},</p>
             <p>Thank you for reaching out to us. We have received your message and will get back to you shortly.</p>
             <p>Best regards,<br>NR Choksi Team</p>`,
    };

    // Send the auto-reply email
    await transporter.sendMail(autoReplyOptions);
    console.log("Auto-reply email sent successfully.");

    res.status(200).json({ message: "Emails sent successfully!" });
  } catch (error) {
    console.error("Error sending email: ", error);
    res.status(500).json({ message: "Failed to send email.", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
