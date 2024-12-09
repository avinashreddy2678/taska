import GroupModel from "../models/GroupModel.js";
import UserModel from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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

    // Create a new user
    const newUser = await UserModel.create({
      username,
      email,
      password,
      createdAt: new Date(),
    });

    const CreateGroup = await GroupModel.create({
      GroupName: "My-Personel Group",
      Allusers: [{ userId: newUser._id, role: "admin" }],
      createdby: newUser._id,
      createdAt: new Date(),
      shareable: false,
      groupType: "groceries",
    });

    await CreateGroup.save();

    await newUser.AllGroups.push(CreateGroup._id);
    await newUser.save();

    return res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error in Signup:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Signin Controller
export const Signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const userExists = await UserModel.findOne({ email }).populate({
      path: "AllGroups",
      populate: {
        path: "Allusers.userId",
        select: "username _id",
      },
      populate: {
        path: "AllProducts",
      },
    });
    if (!userExists) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // console.log(userExists);
    // Verify password (plaintext comparison for now)
    const verifyPassword = userExists.password === password;
    if (!verifyPassword) {
      return res.status(401).json({ message: "Password does not match" });
    }

    let token = jwt.sign({ id: userExists._id }, process.env.JWT_SECREAT, {
      expiresIn: "1d",
    });

    // removing password
    const userWithoutPassword = {
      ...userExists.toObject(),
      password: undefined,
    };

    return res
      .status(200)
      .json({ message: "Signin successful", user: userWithoutPassword, token });
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
