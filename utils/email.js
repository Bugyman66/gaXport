const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendVerificationEmail = (email, token, type = "verify") => {
    const baseUrl = process.env.BASE_URL || "http://localhost:8081";
    const link =
        type === "verify"
            ? `${baseUrl}/api/auth/verify?token=${token}`
            : `${baseUrl}/api/auth/reset-password?token=${token}`;

    const subject = type === "verify" ? "Verify Your Email" : "Reset Your Password";
    const message =
        type === "verify"
            ? `Click the link below to verify your email:`
            : `Click the link below to reset your password:`;

    const mailOptions = {
        from: `"Gas Fee App" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        text: `${message} ${link}`,
        html: `<p>${message}</p><a href="${link}">${link}</a>`
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error("Error sending email:", err);
        } else {
            console.log(`${type === "verify" ? "Verification" : "Password reset"} email sent:`, info.response);
        }
    });
};

module.exports = sendVerificationEmail;
