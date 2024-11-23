
import nodemailer from "nodemailer";
// require('dotenv').config(); // Load environment variables

export const sendVerificationEmail = async (email: string, code: string) => {
   try {
      // Create a transporter object with SMTP settings
      const transporter = nodemailer.createTransport({
         service: 'gmail',
         auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD, // App-specific password
         },
      });

      // Define the email options
      const mailOptions = {
         from: process.env.EMAIL || "thanwanna.dev@gmail.com",
         to: email,
         subject: `${code} is your verification code`,
         text: `


   To verify your account, enter this code in Link:

   ${code}

   Verification codes expire after 5 minutes.
   If you didn't request this code, you can ignore this message 



   ⚠️ this is an automatically generated emaill
   Replies to this email address aren't monitored.

`,
      };

      // Send the email via email
      await transporter.sendMail(mailOptions);

      console.log(`Verification email sent to ${email}`);
   } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send verification email');
   }
};

