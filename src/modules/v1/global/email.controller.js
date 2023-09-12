const path = require('path');
const pug = require('pug');
const nodemailer = require('nodemailer');
const { htmlToText } = require('html-to-text');

module.exports = class Email {
  constructor(user, url = '') {
    this.to = user.email;
    this.firstName = user.name.split(' ').at(0);
    this.url = url;
    this.from = `Taha dlrb <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const templatePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'views',
      'email',
      `${template}.pug`,
    );
    const html = pug.renderFile(templatePath, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    const mailOptions = {
      from: this.from,
      to: this.to,
      text: htmlToText(html),
      subject,
      html,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    return await this.send('welcome', "Welcome to Natour's family");
  }

  async sendResetPasswordUrl() {
    return await this.send('passwordReset', 'Forgot your password?');
  }
};
