const nodemailer = require('nodemailer');

module.exports = {
  sendEmail: async (options) => {
    // 1) Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // 2) Define email options
    const mailOptions = {
      from: options.from || 'Taha dlrb <tahadlrb7@gmail.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      // html:
    };

    // 3) Send the email
    await transporter.sendMail(mailOptions);
  },
};
