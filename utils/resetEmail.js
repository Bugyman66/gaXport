const nodemailer = require("nodemailer");

const sendResetEmail = (email, resetToken) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === "true", // Convert string to boolean
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false, // Prevents TLS issues
        },
    });

    const resetLink = `${process.env.BASE_URL}/api/auth/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: `"VirtualConnekt Support" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Password Reset Request",
        text: `Click the link to reset your password: ${resetLink}`,
        html: `<p>Click the link below to reset your password:</p>
               <a href="${resetLink}">${resetLink}</a>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Password reset email sent:", info.response);
        }
    });
};

module.exports = sendResetEmail;
