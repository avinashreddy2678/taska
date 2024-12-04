import FcmTokenModel from "../models/FcmTokenModel.js";
import GroupModel from "../models/GroupModel.js";
import ProductModel from "../models/ProductModel.js";
import { GetUserById } from "./authController.js";
import { sendNotification } from "./fcmController.js";

export const CreateProduct = async (req, res) => {
  try {
    const { productName, addedby, groupId } = req.body;
    const GroupExists = await GroupModel.findOne({ _id: groupId });
    const AddedUserDetails = await GetUserById(addedby);
    if (!GroupExists) {
      return res.json({ message: "Group not exists" });
    }
    const newProduct = await ProductModel.create({
      productName,
      addedby,
      groupId,
      expirydate: new Date(),
    });
    await newProduct.save();

    // to collect all tokens of users in that group

    const AllGroupUsersIds =
      GroupExists?.Allusers?.map((user) => user.userId) || [];

    // Filter out the addedby user
    const filteredUserIds = AllGroupUsersIds.filter(
      (userid) => userid.toString() !== addedby.toString()
    );

    const UserTokens = await FcmTokenModel.find(
      {
        userId: { $in: filteredUserIds },
      },
      "fcmToken -_id"
    );
    // it will check if any null valies and remove
    const tokens = UserTokens.map((user) => user.fcmToken).filter(
      (item) => item
    );

    if (UserTokens.length > 0) {
      await sendNotification({
        title: "New Product Added",
        body: `${AddedUserDetails.username} added ${productName} to ${GroupExists.GroupName}`,
        tokens: tokens,
      });
    }

    // we get userids here ,we have to get tokens from Fecm model

    await GroupExists.AllProducts.push(newProduct._id);
    await GroupExists.save();

    return res.status(201).json({
      message: "Product created and added to group",
      product: newProduct,
      added: AddedUserDetails.username,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "something went Wrong" });
  }
};
