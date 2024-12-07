import FcmTokenModel from "../models/FcmTokenModel.js";
import GroupModel from "../models/GroupModel.js";
import UserModel from "../models/UserModel.js";
import { sendNotification } from "./fcmController.js";

export const CreateGroup = async (req, res) => {
  try {
    const { GroupName, createdby, groupType } = req.body;
    const Creator = await UserModel.findOne({ _id: createdby });
    if (!Creator) {
      return res.status(500).json({ message: "Something went wrong" });
    }
    const newGroup = await GroupModel.create({
      GroupName,
      createdby,
      creatorName: Creator.username,
      groupType,
    });

    await newGroup.save();
    // save the group in users

    // add this creator to that group as memebr and then add group to user list
    await newGroup.Allusers.push({
      userId: { _id: createdby, username: Creator.username },
      role: "admin",
    });
    await Creator.AllGroups.push(newGroup._id);
    await newGroup.save();
    await Creator.save();
    return res
      .status(201)
      .json({ message: "new Group created", group: newGroup });
  } catch (error) {
    console.log(error);
  }
};

export const AddPeopletoGroup = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    const GroupExists = await GroupModel.findOne({ _id: groupId });
    if (!GroupExists) {
      return res.status(400).json({ message: "Group not exists" });
    }
    const userExists = await UserModel.findOne({ _id: userId });
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

    await userExists.AllGroups.push(groupId);
    await userExists.save();

    const userToken = await FcmTokenModel.findOne({ userId });
    console.log(userToken);
    if (userToken.fcmToken) {
      const fcmTokens = [userToken.fcmToken];
      await sendNotification(
        "New Group",
        `You are added in ${GroupExists.GroupName}`,
        fcmTokens
      );
    }

    return res.status(201).json({
      message: "User added to the group successfully",
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
