import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";

export const VerifyUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }
    if (!process.env.JWT_SECREAT) {
      return res.status(500).json({
        message: "JWT secret key is not set in environment variables",
      });
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECREAT);
    // console.log('Decoded token:', decoded); // For debugging purposes

    // Attach decoded user information to the request object
    req.user = decoded;

    const user =await UserModel.findOne({ _id: req.user._id });
    if (!user.isVerified) {
      return res.json({ message: "User not vieriefed" });
    }

    // Proceed to next middleware or route handler
    next();
  } catch (error) {
    console.log("JWT Verification Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired, please log in again" });
    }

    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
