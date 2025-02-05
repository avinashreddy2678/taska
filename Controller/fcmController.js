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
    // get only id
    const userDetails = await getUserFromToken(token);
    // console.log(userDetails, "user");
    if (!userDetails) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // Find existing FCM token for the user
    const userWithToken = await FcmTokenModel.findOne({
      userId: userDetails._id,
    });
    // console.log(userWithToken);

    if (!userWithToken) {
      // Create a new record if none exists
      const CreatedFcmToken = await FcmTokenModel.create({
        userId: userDetails._id,
        fcmToken,
        lastUpdated: new Date(),
      });
      await CreatedFcmToken.save();
      // console.log(CreatedFcmToken);
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
    const decoded = jwt.verify(token, process.env.JWT_SECREAT);
    // console.log(decoded);
    return decoded; // This will contain user details if verification is successful
  } catch (error) {
    console.error("Error decoding token:", error);
    return null; // Return null if token verification fails
  }
};
export const sendNotification = async (title, body, fcmTokens, data = null) => {
  // console.log(newData);

  const message = {
    notification: {
      title: title,
      body: body,
    },
    tokens: fcmTokens,
  };
  if (data) {
    message.data = data;
  }

  try {
    const res = await admin.messaging().sendEachForMulticast(message);

    // console.log("Notification sent successfully:", res);
    res.responses.forEach((response, index) => {
      if (!response.success) {
        console.error(
          `Error sending to token ${fcmTokens[index]}:`,
          response.error
        );
      }
    });

    return res;
  } catch (error) {
    console.error("Error sending notification:", error.message);
    return { message: "Something went wrong", error: error.message };
  }
};
