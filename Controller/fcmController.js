import jwt from "jsonwebtoken";
import FcmTokenModel from "../models/FcmTokenModel.js";
import admin from "../config/fcmAdmin.js";
import dotenv from "dotenv";
dotenv.config();
export const SaveFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const userDetails = await getUserFromToken(token, process.env.JWT_SECREAT);

    if (!userDetails) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // Find existing FCM token for the user
    const userWithToken = await FcmTokenModel.findOne({
      userId: userDetails._id,
    });

    if (!userWithToken) {
      // Create a new record if none exists
      await FcmTokenModel.create({
        userId: userDetails._id,
        fcmToken,
        lastUpdated: new Date(),
      });
      return res.json({ message: "FCM token saved successfully" });
    } else {
      // Update existing record if the token has changed
      if (userWithToken.fcmToken !== fcmToken) {
        userWithToken.fcmToken = fcmToken;
        userWithToken.lastUpdated = new Date();
        await userWithToken.save();
        return res.json({ message: "FCM token updated successfully" });
      }
    }

    // If the same token is provided, you may choose to do nothing or respond accordingly
    return res.status(200).json({ message: "FCM token already up-to-date" });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Function to decode and verify the JWT
export const getUserFromToken = async (token) => {
  try {
    const decoded = jwt.verify(token);
    return decoded; // This will contain user details if verification is successful
  } catch (error) {
    console.error("Error decoding token:", error);
    return null; // Return null if token verification fails
  }
};

export const sendNotification = async (title, body, tokens) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: tokens,
  };
  try {
    const res = await admin.messaging().sendEachForMulticast(message);
    console.log(res);
    return res;
  } catch (error) {
    console.log(error);
    return res.json({ message: "Something went wrong" });
  }
};
