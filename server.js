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

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "nitindube227@gmail.com", // Your email
        pass: "rraqniyxpaflfhdk", // Your email password
      },
    });

    const mailOptions = {
      from: `"NR Choksi" "nitindube227@gmail.com"`,
      to: user_email,
      subject: "Contact Form Details",
      text: message,
      html: `<p><b>Name:</b> ${user_name}</p>
             <p><b>Email:</b> ${user_email}</p>
             <p><b>Contact:</b> ${user_contact}</p>
             <p><b>Message:</b> ${message}</p>`,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email: ", error);
    res.status(500).json({ message: "Failed to send email." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
