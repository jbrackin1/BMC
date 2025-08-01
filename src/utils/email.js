require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // should be 'gmail'
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendMfaCode = async (to, code) => {
  const mailOptions = {
    from: `"BetterMindCare" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your MFA Code",
    text: `Your secure login code is: ${code}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ MFA email sent.");
  } catch (err) {
    console.error("❌ Email failed:", err);
  }
};

exports.sendPasswordResetEmail = async (to, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"BetterMindCare" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset Your Password",
    text: `You requested to reset your password.\n\nClick below:\n${resetLink}`,
    html: `
      <p>You requested to reset your password.</p>
      <p>
        <a href="${resetLink}" style="background:#333;color:#fff;padding:10px 15px;text-decoration:none;border-radius:4px;">
          Reset Password
        </a>
      </p>
      <p>If you didn't request this, you can safely ignore it.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent.");
  } catch (err) {
    console.error("❌ Email failed:", err);
  }
};