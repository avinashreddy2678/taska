import GroupModel from "../models/GroupModel.js";
import UserModel from "../models/UserModel.js";

export const CreateGroup = async (req, res) => {
  try {
    const { GroupName, createdby } = req.body;
    const newGroup = await GroupModel.create({
      GroupName,
      createdby,
    });
    await newGroup.save();
    // save the group in users
    const Creator = await UserModel.findOne({ _id: createdby });
    if (!Creator) {
      return res.status(500).json({ message: "Something went wrong" });
    }

    await Creator.AllGroups.push(newGroup._id);
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
    console.log(GroupExists.Allusers[0], userId);
    if (userAlreadyinGroup) {
      return res.json({ message: "User Already in Group" });
    }
    await GroupExists.Allusers.push({ userId, role: "member" });
    await GroupExists.save();

    await userExists.AllGroups.push(groupId);
    await userExists.save();
    return res.status(201).json({
      message: "User added to the group successfully",
      group: GroupExists,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
