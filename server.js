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
      html: `
        <div style="font-family: Arial, sans-serif; margin: 20px; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <p style="font-size: 16px; color: #555;">
            <b>Name:</b> ${user_name}<br>
            <b>Email:</b> ${user_email}<br>
            <b>Contact:</b> ${user_contact}<br>
            <b>Message:</b>
          </p>
          <blockquote style="border-left: 4px solid #007BFF; padding-left: 10px; color: #555; font-style: italic;">
            ${message}
          </blockquote>
          <footer style="margin-top: 20px; font-size: 12px; color: #999;">
            This email was sent from your contact form.
          </footer>
        </div>
      `,
      attachments,
    };

    // Send the primary email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);

    // Auto-reply email to the sender
    //     const autoReplyOptions = {
    //       from: `"NR Choksi" <${process.env.EMAIL_USER}>`,
    //       to: user_email,
    //       subject: "Thank You for Reaching Out to NR Choksi Jewels!",
    //       text: `Dear ${user_email},\n\nThank you for reaching out to us. We have received your message and will get back to you shortly.\n\nBest regards,\nNR Choksi Team`,
    //       html: `<p>Dear ${user_name},</p>
    //              <p>Thank you for contacting NR Choksi Jewels! We appreciate you taking the time to reach out to us.</p>
    //              <p>Your inquiry is important to us, and we want to assure you that we are reviewing your request. Whether you have questions about our jewellery collections, need assistance with an order, or have any other inquiries, we are here to help.</p>
    //              <p>If you have provided specific details in your message, our team will get back to you shortly with the information you need. In the meantime, feel free to explore our latest collections on our website https://nrcjewels.com/ or follow us on our social media channels for updates and inspiration.
    // </p>
    // <p>Thank you once again for your interest in NR Choksi Jewels. We look forward to assisting you!
    // </p>
    // <p>Warm regards,<br>
    // NR Choksi Jewels<br>
    // Contacts:</br>
    // +61 449 803 821 <br>
    // +61 472 847 036<br>
    // +91 9328288089
    // </P>
    // <p>
    // Email: 
    // dhyana.nrc@gmail.com
    // </p>             <p>Best regards,<br>NR Choksi Team</p>`,
    //     };

    //     // Send the auto-reply email
    //     await transporter.sendMail(autoReplyOptions);
    //     console.log("Auto-reply email sent successfully.");

    res.status(200).json({ message: "Emails sent successfully!" });
  } catch (error) {
    console.error("Error sending email: ", error);
    res.status(500).json({ message: "Failed to send email.", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
