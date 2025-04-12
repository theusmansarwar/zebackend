const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.fastmail.com", // GoDaddy SMTP server
  port: 465,
  secure: true,
  auth: {
    user: process.env.PEMAIL_USER,
    pass: process.env.PEMAIL_PASS,
  },
});

const sendEmailToCompany = ({ email, name, subject, phone, query }, res) => {
  // ✅ 1. Email to the Customer
  const customerMailOptions = {
    from: `"PlutoSec" <${process.env.PEMAIL_USER}>`,
    to: email,
    subject: `Thank You for Reaching Out – Pluto IT Solutions Inc`,
    html: `
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table cellpadding="0" cellspacing="0" border="0" 
          style="width: 100%; background-color: #f4f4f4; padding: 20px; text-align: center;">
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0" border="0" 
                style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; 
                overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #0052cc; padding: 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Thank You for Contacting PlutoSec</h1>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding: 20px; text-align: left; color: #333333;">
                    <p style="margin: 0; font-size: 16px;">Dear ${name},</p>
                    <p style="margin: 16px 0; font-size: 16px;">
                      Thank you for reaching out to <strong>PlutoSec</strong>. We have received your query and our team will get back to you shortly.
                    </p>
                  
                    <p style="margin: 16px 0; font-size: 16px;">We appreciate your patience and look forward to assisting you.</p>
                    <p style="margin: 16px 0; font-size: 16px;">Best regards,</p>
                    <p style="margin: 0; font-size: 16px; font-weight: bold;">PlutoSec Team</p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 14px; color: #777777;">
                    <p style="margin: 0;">&copy; 2025 PlutoSec. All rights reserved.</p>
                    <p style="margin: 0;">Visit us: <a href="https://plutosec.ca" style="color: #0052cc; text-decoration: none;">plutosec.ca</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    `,
  };

  // ✅ 2. Email to the Admin
  const adminMailOptions = {
    from: `"PlutoSec" <${process.env.PEMAIL_USER}>`,
    to: process.env.PADMIN_EMAIL,
    subject: `New Lead from ${name}`,
    html: `
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table cellpadding="0" cellspacing="0" border="0" 
          style="width: 100%; background-color: #f4f4f4; padding: 20px; text-align: center;">
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0" border="0" 
                style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; 
                overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #d9534f; padding: 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Lead Received</h1>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding: 20px; text-align: left; color: #333333;">
                    <p style="margin: 0; font-size: 16px;"><strong>Name:</strong> ${name}</p>
                    <p style="margin: 0; font-size: 16px;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 0; font-size: 16px;"><strong>Phone:</strong> ${phone}</p>
                    <p style="margin: 0; font-size: 16px;"><strong>Subject:</strong> ${subject}</p>
                    <p style="margin: 16px 0; font-size: 16px;"><strong>Query:</strong></p>
                    <p style="margin: 0; font-size: 16px;">${query}</p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 14px; color: #777777;">
                    <p style="margin: 0;">This is an automated email. Please do not reply.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    `,
  };

  // Send Emails
  transporter.sendMail(customerMailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email to customer:", error);
      return res.status(500).json({ status: 500, message: "Error sending email to customer" });
    }

    transporter.sendMail(adminMailOptions, (adminError, adminInfo) => {
      if (adminError) {
        console.error("Error sending email to admin:", adminError);
        return res.status(500).json({ status: 500, message: "Error sending email to admin" });
      }

      return res.status(200).json({ status: 200, message: "Emails sent successfully" });
    });
  });
};

module.exports = sendEmailToCompany;
