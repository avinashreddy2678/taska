import GroupModel from "../models/GroupModel.js";
import UserModel from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import VerificationModel from "../models/VerificationModel.js";
import { sendMail } from "../utils/sendMail.js";
dotenv.config();
// Signup Controller
export const Signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if user already exists
    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
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

    return res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error in Signup:", error);
    return res.status(500).json({ message: "Something went wrong" });
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
    console.log(otp, userExists.otp);
    const verify = (await userExists.otp) === otp;
    if (!verify) {
      return res.json({ message: "Otp is Wrong" });
    }

    const existingUser = await UserModel.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

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
      return res.status(404).json({ message: "User does not exist" });
    }

    // console.log(userExists.AllGroups[0].Allusers);
    // Verify password (plaintext comparison for now)
    bcrypt.compare(password, userExists.password, async (err, result) => {
      if (err) {
        return res.json({ message: "something went Wrong" });
      }
      if (!result) {
        return res.json({ message: "Password wrong" });
      }
      if (!userExists.isVerified) {
        await generateOtp(userExists.email);
        return res.json({ message: "User not verified", success: false });
      }
      let token = jwt.sign(
        { _id: userExists._id, email: email },
        process.env.JWT_SECREAT,
        {
          expiresIn: "30d",
        }
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
    await sendMail(email, newOtp);
  } catch (error) {
    console.log(error);
    return;
  }
};
