// utils/sendemail.js
const { Resend } = require("resend");

const resend = new Resend('re_GV1WP8Bk_EcmEjJpGe5uhJfC6GYDixQoS');

async function sendEmailHandler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, html, subject } = req.body;

    const { data, error } = await resend.emails.send({
      from: "ChemT <onboarding@resend.dev>",
      to: "piyushjoshi1812@gmail.com",
      subject,
      html,
    });

    if (error) {
      
      console.log("sending email error ", error)
      return res.status(500).json({ message: "Failed to send email", error });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.log("sending email error ", err)
    return res.status(500).json({ message: err.message });
  }
}

module.exports = sendEmailHandler;
