import GroupModel from "../models/GroupModel.js";
import UserModel from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import VerificationModel from "../models/VerificationModel.js";
import { sendMail } from "../utils/sendMail.js";
import FcmTokenModel from "../models/FcmTokenModel.js";
dotenv.config();
// Signup Controller
export const Signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if user already exists
    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User Already Exists", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // const CreateGroup = await GroupModel.create({
    //   GroupName: "My Group",
    //   Allusers: [{ userId: newUser._id, role: "admin" }],
    //   createdby: newUser._id,
    //   createdAt: new Date(),
    //   shareable: false,
    //   // groupType: "groceries",
    // });

    // await CreateGroup.save();

    // await newUser.AllGroups.push(CreateGroup._id);
    await newUser.save();
    // it will generate and send otp to taht email
    await generateOtp(newUser.email);

    return res.status(201).json({
      message: "Verification Otp is sent ",
      user: newUser,
      success: true,
    });
  } catch (error) {
    console.error("Error in Signup:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong", success: false });
  }
};

// verify Otp
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const userExists = await VerificationModel.findOne({ email });
    if (!userExists) {
      return res.json({ message: "user not exists" });
    }
    const hasExpired = (await userExists.expiresIn) < new Date();
    if (hasExpired) {
      await generateOtp(userExists.email);
    }
    // console.log(otp, userExists.otp);
    const verify = (await userExists.otp) === otp;
    if (!verify) {
      return res.json({ message: "Otp is Invalid", success: false });
    }

    const existingUser = await UserModel.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    // console.log(userExists);

    if (userExists) {
      const res = await VerificationModel.deleteMany({ email });
    }

    let token = jwt.sign(
      { _id: existingUser._id, email: email },
      process.env.JWT_SECREAT,
      {
        expiresIn: "30d",
      }
    );

    const userWithoutPassword = {
      ...existingUser.toObject(),
      password: undefined,
    };
    let subject = `Welcome to Shelfy, ${userExists.username}! 🌟`;
    let content = `"<html><body style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>
<h2 style='text-align: center; color: #4CAF50;'>Hi ${userExists.username},</h2>
<p>Welcome to <strong>Shelfy</strong>—your partner for smarter tracking and organized living! We're thrilled to have you on board.</p>
<h3>What You Can Do with Shelfy:</h3>
<ul>
  <li>✅ <strong>Track Expiry Dates:</strong> Add products by scanning or manual entry to ensure you never miss consuming them at their best.</li>
  <li>✅ <strong>Create Groups for Better Management:</strong> Organize products into categories like perishables, snacks, or beverages.</li>
  <li>✅ <strong>Collaborate Seamlessly:</strong> Invite family, friends, or colleagues to groups and track shared items together.</li>
  <li>✅ <strong>Analyze Product Usage:</strong> Access a dedicated analytics page to review usage trends, reduce waste, and save smarter.</li>
</ul>
<h3>Get Started in 3 Simple Steps:</h3>
<ol>
  <li>1️⃣ <strong>Add Products:</strong> Scan the barcode or manually input details to keep track of expiry dates.</li>
  <li>2️⃣ <strong>Create Groups:</strong> Organize items into custom groups (e.g., fruits, packaged foods) and invite others to collaborate.</li>
  <li>3️⃣ <strong>Track & Stay Notified:</strong> Stay updated with reminders before expiry dates and insights into your product usage.</li>
</ol>
<p>With <strong>Shelfy</strong>, you're not just staying organized; you're making conscious choices for a more efficient and sustainable lifestyle.</p>
<p>If you have any questions, need support, or just want to say hi, we’re here for you at <a href='mailto:support@shelfy.com' style='color: #4CAF50;'>support@shelfy.com</a>.</p>
<p style='text-align: center;'>
  <a href='#' style='display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px;'>Launch the app now</a>
</p>
<p>Here’s to a clutter-free, waste-free journey!</p>
<p>Warm regards,<br>The Shelfy Team</p>
</body></html>"
`;
    await sendMail(userExists.email, subject, content);
    return res.status(200).json({
      message: "Otp Verified successful",
      user: userWithoutPassword,
      token,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.json({ message: "something went wrong" });
  }
};

// Signin Controller
export const Signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const userExists = await UserModel.findOne({ email });

    // .populate({
    //   path: "AllGroups",
    // populate: [
    //   {
    //     path: "Allusers.userId", // Populate user details inside Allusers
    //     select: "_id", // Select only the fields you need
    //   },
    //   // {
    //   //   path: "AllProducts", // Populate AllProducts
    //   // },
    // ],
    // });
    if (!userExists) {
      return res
        .status(404)
        .json({ message: "User does not exist", success: false });
    }

    // console.log(userExists.AllGroups[0].Allusers);
    // Verify password (plaintext comparison for now)
    bcrypt.compare(password, userExists.password, async (err, result) => {
      if (err) {
        return res.json({ message: "something went Wrong" });
      }
      if (!result) {
        return res.json({ message: "Password wrong", success: false });
      }
      if (!userExists.isVerified) {
        await generateOtp(userExists.email); // Generate OTP for verification
        return res
          .status(403)
          .json({ message: "User not verified. OTP sent.", success: false });
      }
      let token = jwt.sign(
        { _id: userExists._id, email: email },
        process.env.JWT_SECREAT,
        {
          expiresIn: "30d",
        }
      );

      await FcmTokenModel.findOneAndUpdate(
        { userId: userExists._id },
        { $set: { isLoggedin: true } },
        { new: true }
      );
      const userWithoutPassword = {
        ...userExists.toObject(),
        password: undefined,
      };

      return res.status(200).json({
        message: "Signin successful",
        user: userWithoutPassword,
        token,
        success: true,
      });
    });

    // removing password
  } catch (error) {
    console.error("Error in Signin:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong", success: false });
  }
};

export const ResendOtp = async (req, res) => {
  const { email } = req.query;
  try {
    const getOtp = await VerificationModel.findOne({ email });
    if (!getOtp || getOtp.expiresIn < new Date()) {
      await generateOtp(email);
    } else {
      let subject = "Welcome to Shelfy! Here's Your OTP";
      let content = `<div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
        <h2 style="text-align: center; color: #2d88e4;">Thank you for joining Shelfy</h2>
        <p style="font-size: 16px;">
            Your ultimate companion for smarter product tracking and consumption.
        </p>
        <p style="font-size: 16px;">
            To complete your registration, please use the following One-Time Password (OTP):
        </p>
        <h3 style="font-size: 20px; font-weight: bold; color: #e74c3c; text-align: center;">${getOtp.otp}</h3>
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
    </div> `;
      await sendMail(email, subject, content);
    }

    return res.json({ message: "Otp sent to Mail", success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went Wrong", success: false });
  }
};

export const userUpdates = async (req, res) => {
  const { userId, updatedAt } = req.query;
  const updatedAtQuery = new Date(updatedAt);

  try {
    const User = await UserModel.findOne(
      { _id: userId },
      "updatedAt AllGroups"
    );
    if (!User) {
      return res
        .status(400)
        .json({ message: "User not Found", success: false });
    }
    // console.log(User.updatedAt, updatedAtQuery);
    if (new Date(User.updatedAt).getTime() === updatedAtQuery.getTime()) {
      return res.json({ message: "Data is Synced", success: true });
    }

    return res.status(200).json({ message: "User details found", User });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const GetUserById = async (userId) => {
  try {
    const UserDetails = await UserModel.findOne({ _id: userId }, "-password");
    return UserDetails;
  } catch (error) {
    console.log(error);
  }
};

// generate new Otp and send to email
const generateOtp = async (email) => {
  try {
    const existingOtp = await VerificationModel.findOne({ email });
    if (existingOtp) {
      await VerificationModel.deleteMany({ email });
    }
    const expiresIn = new Date(new Date().getTime() + 360 * 1000);
    const newOtp = Math.floor(1000 + Math.random() * 9000);
    const res = await VerificationModel.create({
      email,
      otp: newOtp,
      expiresIn,
    });
    await res.save();
    let subject = "Welcome to Shelfy! Here's Your OTP";
    let content = `<div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
        <h2 style="text-align: center; color: #2d88e4;">Thank you for joining Shelfy</h2>
        <p style="font-size: 16px;">
            Your ultimate companion for smarter product tracking and consumption.
        </p>
        <p style="font-size: 16px;">
            To complete your registration, please use the following One-Time Password (OTP):
        </p>
        <h3 style="font-size: 20px; font-weight: bold; color: #e74c3c; text-align: center;">${newOtp}</h3>
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
    </div> `;
    await sendMail(email, subject, content);
  } catch (error) {
    console.log(error);
    return;
  }
};

export const handleLogout = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const result = await FcmTokenModel.updateOne(
      { userId },
      { $set: { isLoggedin: false } }
    );

    if (result.modifiedCount > 0) {
      return res
        .status(200)
        .json({ message: "User logged out and token cleared", success: true });
    } else {
      return res.status(404).json({
        message: "User not found or already logged out",
        success: false,
      });
    }
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
