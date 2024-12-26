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

export const sendMail = async (email, subject, content) => {
  try {
    await transporter.sendMail({
      from: {
        name: "Shelfiy",
        address: "storywritings87@gmail.com",
      },
      to: email,
      subject: subject,
      html: content,
    });
  } catch (error) {
    console.log(error);
  }
};
