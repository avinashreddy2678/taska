import nodeMailer from "nodemailer";

const transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "storywritings87@gmail.com",
    pass: process.env.pass,
  },
  tls: {
    rejectUnauthorized: false, // Bypasses SSL verification (use with caution)
  },
});

export const sendMail = async (email, Otp) => {
  try {
    await transporter.sendMail({
      from: {
        name: "Shelfiy",
        address: "storywritings87@gmail.com",
      },
      to: email,
      subject: "Welcome to Shelfy! Here's Your OTP",
      html: `<div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
        <h2 style="text-align: center; color: #2d88e4;">Thank you for joining Shelfy</h2>
        <p style="font-size: 16px;">
            Your ultimate companion for smarter product tracking and consumption.
        </p>
        <p style="font-size: 16px;">
            To complete your registration, please use the following One-Time Password (OTP):
        </p>
        <h3 style="font-size: 20px; font-weight: bold; color: #e74c3c; text-align: center;">${Otp}</h3>
        <p style="font-size: 16px;">
            This code is valid for the next 10 minutes. If you didn't request this, you can safely ignore this email.
        </p>
        <p style="font-size: 16px;">
            We're thrilled to have you on board and can't wait for you to experience all that Shelfy has to offer—streamlined organization, waste reduction, and smarter collaboration.
        </p>
        <p style="font-size: 16px;">
            If you have any questions, feel free to reach out to our support team at 
            <a href="mailto:support@shelfy.com" style="color: #2d88e4;">support@shelfy.com</a>.
        </p>
        <p style="font-size: 16px;">
            Enjoy your journey with Shelfy!
        </p>
        <p style="font-size: 16px; font-weight: bold;">
            Warm regards,<br>
            The Shelfy Team
        </p>
    </div> `,
    });
  } catch (error) {
    console.log(error);
  }
};
