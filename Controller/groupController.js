import mongoose from "mongoose";
import FcmTokenModel from "../models/FcmTokenModel.js";
import GroupModel from "../models/GroupModel.js";
import UserModel from "../models/UserModel.js";
import { sendNotification } from "./fcmController.js";
import ProductModel from "../models/ProductModel.js";

export const CreateGroup = async (req, res) => {
  try {
    const { GroupName, createdby } = req.body;
    const Creator = await UserModel.findOneAndUpdate(
      { _id: createdby },
      { updatedAt: new Date() },
      { new: true }
    );

    if (!Creator) {
      return res.status(500).json({ message: "Something went wrong" });
    }
    const newGroup = await GroupModel.create({
      GroupName,
      createdby,
      creatorName: Creator.username,
      // groupType: "groceries",
    });

    await newGroup.save();
    // save the group in users
    // add this creator to that group as memebr and then add group to user list
    await newGroup.Allusers.push({
      userId: createdby,
      role: "admin",
    });
    await Creator.AllGroups.push(newGroup._id);
    await newGroup.save();
    await Creator.save();
    return res.status(201).json({
      message: "new Group created",
      group: newGroup,
    });
  } catch (error) {
    console.log(error);
  }
};

// for online
export const getUserOfGroup = async (req, res) => {
  const { groupId } = req.query;
  try {
    const Group = await GroupModel.findOne({ _id: groupId }).populate({
      path: "Allusers.userId",
      select: "_id username email",
    });
    if (!Group) {
      return res.json({ message: "No Group Found" });
    }
    // console.log(Group);
    return res.json({ message: "Group Found", Users: Group.Allusers });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrond" });
  }
};

export const AddPeopletoGroup = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    const GroupExists = await GroupModel.findOne({ _id: groupId });
    if (!GroupExists) {
      return res.status(400).json({ message: "Group not exists" });
    }
    const userExists = await UserModel.findOneAndUpdate(
      { _id: userId },
      { updatedAt: new Date() },
      { new: true }
    );
    // const creatorExists = await UserModel.findOne({ _id: createdby });
    if (!userExists) {
      return res.status(400).json({ message: "user or creator not exists" });
    }
    const userAlreadyinGroup = GroupExists.Allusers.some(
      (user) => user?.userId?.toString() === userId
    );
    if (userAlreadyinGroup) {
      return res.json({ message: "User Already in Group" });
    }
    await GroupExists.Allusers.push({ userId, role: "member" });
    await GroupExists.save();
    await UserModel.findOneAndUpdate(
      { _id: userId },
      {
        $push: { AllGroups: groupId },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );

    const userToken = await FcmTokenModel.findOne({ userId });

    if (userToken.fcmToken && userToken.isLoggedin) {
      const fcmTokens = [userToken.fcmToken];
      console.log(fcmTokens)
      await sendNotification(
        "You're Invited to a Shelf!",
        ` 🎉 ${GroupExists.creatorName} added you to ${GroupExists.GroupName}! Tap to explore and start organizing together!`,
        fcmTokens
      );
    }

    // given direct member option inly
    const responseData = {
      role: "member",
      userId: {
        username: userExists.username,
        _id: userExists._id,
        email: userExists.email,
      },
    };

    return res.status(201).json({
      message: "User added to the group successfully",
      user: responseData,
      group: GroupExists,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getUserDetailsfromGroup = async (req, res) => {
  const { groupid, userid } = req.query;
  try {
    const GroupDetails = await GroupModel.findOne({ _id: groupid }).populate({
      path: "Allusers.userId",
      select: "-password -AllGroups -AllProducts",
    });
    if (!GroupDetails) {
      return res.json({ message: "No Group Found" });
    }

    const UserInGroup = GroupDetails.Allusers.some(
      (user) => user.userId._id.toString() == userid.toString()
    );
    if (!UserInGroup) {
      return res.json({ message: "You have No Connection with this Group" });
    }
    return res.json({ message: "Group Details", GroupDetails: GroupDetails });
  } catch (error) {
    console.log(error);
  }
};

export const deleteGroupbyAdmin = async (req, res) => {
  const { groupId, userId } = req.query;
  try {
    const Group = await GroupModel.findOne({ _id: groupId });
    if (!Group) {
      return res.status(400).json({ message: "Group not found" });
    }
    if (Group.createdby.toString() !== userId.toString()) {
      return res.status(400).json({ message: "You are not admin" });
    }

    const userIds = Group.Allusers.map((id) => id.userId.toString());

    const UserTokens = await FcmTokenModel.find(
      {
        userId: { $in: userIds }, // Convert to strings
      },
      "fcmToken -_id isLoggedin"
    );
    // it will check if any null valies and remove
    const fcmTokens = UserTokens.filter((user) => user.isLoggedin === true).map(
      (user) => user.fcmToken
    );

    // const fcmTokens = fcms.map((item) => item.fcmToken);
    await sendNotification(
      "Group Alert",
      ` ${Group.GroupName} Group is deleted by ${Group.creatorName}`,
      fcmTokens
    );
    await UserModel.updateMany(
      { _id: { $in: userIds } },
      { $pull: { AllGroups: groupId } }
    );

    await UserModel.updateMany(
      { _id: { $in: userIds } },
      { $set: { updatedAt: new Date() } }
    );

    const ressss = await ProductModel.deleteMany({
      _id: { $in: Group.AllProducts },
    });
    console.log(ressss);

    await Group.deleteOne({ _id: groupId });
    return res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Something went wrong" });
  }
};
export const leaveFromGroup = async (req, res) => {
  const { groupId, userId } = req.query;

  // Validate input
  if (!groupId || !userId) {
    return res.status(400).json({
      success: false,
      message: "Both groupId and userId are required",
    });
  }

  try {
    // Fetch group details
    const group = await GroupModel.findById(groupId);

    // Check if the group exists
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if the user is the group admin
    if (group.createdby.toString() === userId) {
      return res.status(403).json({
        success: false,
        message: "Admin cannot leave the group",
      });
    }

    // Check if the user is part of the group
    // console.log(group.Allusers,userId)
    const isMember = group.Allusers.some(
      (user) => user.userId.toString() === userId
    );
    // console.log(isMember)
    if (!isMember) {
      return res.status(404).json({
        success: false,
        message: "User is not a member of this group",
      });
    }

    const userIds = group.Allusers.filter((user) => user.userId !== userId).map(
      (user) => user.userId
    );

    const UserTokens = await FcmTokenModel.find(
      {
        userId: { $in: userIds },
      },
      "fcmToken -_id isLoggedin"
    );

    // it will check if any null valies and remove
    const fcmTokens = UserTokens.filter((user) => user.isLoggedin === true).map(
      (user) => user.fcmToken
    );

    await GroupModel.findByIdAndUpdate(
      groupId,
      { $pull: { Allusers: { userId: userId } } },
      { new: true }
    );

    await group.save();

    // Remove the group ID from the user's AllGroups array
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    await sendNotification(
      "Group Alert",
      `${user.username} left the ${group.GroupName} Group `,
      fcmTokens
    );
    user.AllGroups = user.AllGroups.filter((id) => id.toString() !== groupId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User has successfully left the group",
    });
  } catch (error) {
    console.error("Error in leaveFromGroup:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again later",
    });
  }
};

export const removeUserbyAdmin = async (req, res) => {
  const { adminId, groupId, userId } = req.query;
  try {
    const findGroup = await GroupModel.findOne({ _id: groupId });
    if (!findGroup) {
      return res.json({ message: "No Group Found", success: false });
    }

    // console.log(findGroup.createdby.toString(),"creator by")

    if (adminId === userId) {
      return res.json({ message: "You cant remove Yourself", success: false });
    }

    const checkAdmin = findGroup.createdby.toString() === adminId.toString();
    if (!checkAdmin) {
      return res.json({ message: "You are not Authorized", success: false });
    }
    const userExists = await GroupModel.updateOne(
      { _id: groupId },
      { $pull: { Allusers: { userId: userId } } },
      { new: true }
    );
    if (!userExists) {
      return res.json({ message: "User not Found", success: false });
    }
    return res.json({
      message: "User removed success",
      success: true,
      group: findGroup,
    });
  } catch (error) {
    return res.json({ message: "Something went Wrong" });
  }
};
