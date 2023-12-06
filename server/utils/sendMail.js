import dotenv from "dotenv";
import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

// load env variables
dotenv.config();

// Function to send email
async function sendMail(Emailoptions) {
  // create transporter object using nodemailer.createTransport()
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const { userEmail, subject, templateName, templateData } = Emailoptions;

  // get current directory
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // get email template path using template name
  const templatePath = path.join(__dirname, "../template", templateName);

  // Render HTML template for email using ejs.renderFile()
  const htmlTemplate = await ejs.renderFile(templatePath, templateData);

  // send mail using transporter.sendMail()
  await transporter.sendMail({
    from: process.env.SMTP_MAIL,
    to: userEmail,
    subject,
    html: htmlTemplate,
  });
}

export default sendMail;
