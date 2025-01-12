import mongoose from "mongoose";
import FcmTokenModel from "../models/FcmTokenModel.js";
import GroupModel from "../models/GroupModel.js";
import ProductModel from "../models/ProductModel.js";
import UserModel from "../models/UserModel.js";
import { GetUserById } from "./authController.js";
import { sendNotification } from "./fcmController.js";

export const CreateProduct = async (req, res) => {
  try {
    const {
      productName,
      addedby,
      groupId,
      expirydate,
      barCodeId,
      quantity,
      price,
    } = req.body;
    const GroupExists = await GroupModel.findOne({ _id: groupId });
    const AddedUserDetails = await GetUserById(addedby);
    if (!GroupExists) {
      return res.json({ message: "Group not exists" });
    }
    const newProduct = await ProductModel.create({
      productName,
      addedby,
      groupId,
      expirydate,
      barCodeId,
      quantity,
      price,
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
        userId: { $in: filteredUserIds }, // Convert to strings
      },
      "fcmToken -_id isLoggedin"
    );
    
    // it will check if any null valies and remove
    const fcmTokens = UserTokens
    .filter((user) => user.isLoggedin === true).map((user) => user.fcmToken); 



    if (fcmTokens.length > 0) {
      await sendNotification(
        "New Item Added!",
        `${AddedUserDetails.username} added ${productName} to ${GroupExists.GroupName}. Tap to check it out!`,
        fcmTokens
      );
    }

    // we get userids here ,we have to get tokens from Fecm model

    await GroupExists.AllProducts.push(newProduct._id);
    await GroupExists.save();

    return res.status(201).json({
      message: "Product created and added to group",
      product: newProduct,
      addeduserName: AddedUserDetails.username,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "something went Wrong" });
  }
};

export const changeProductStatus = async (req, res) => {
  try {
    const { _id, status, groupId } = req.body;
    const Product = await ProductModel.findOneAndUpdate(
      { _id },
      { status },
      { new: true }
    );
    if (!Product) {
      return res.status(400).json({ message: "Product not Found",success:true });
    }
    const Group = await GroupModel.findByIdAndUpdate(
      { _id: groupId },
      { updatedAt: new Date() },
      { new: true }
    );
    if (!Group) {
      return res.status(400).json({ message: "Group Not Found" });
    }
    await Group.save();
    return res.status(200).json({ message: "Product updated" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "something went Wrong" });
  }
};

export const getAllGroupProducts = async (req, res) => {
  const { groupId } = req.query;

  try {
    // Find the group and populate the AllProducts field
    const group = await GroupModel.findOne({ _id: groupId }).populate(
      "AllProducts"
    );

    if (!group) {
      return res.status(404).json({ message: "No Group Found" });
    }

    // Send the populated group details along with its products
    return res.status(200).json({ message: "success", group });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const editProductdetails = async (req, res) => {
  const { productId, ...updateFields } = req.body;
  console.log(productId);
  try {
    const Product = await ProductModel.findByIdAndUpdate(
      { _id: productId },
      { $set: updateFields },
      { new: true }
    );
    if (!Product) {
      return res.json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "product updated", Product });
  } catch (error) {
    return res.status(500).json({ message: "Somethig went Wrong" });
  }
};

export const deleteProduct = async (req, res) => {
  const { productId, groupId } = req.query;
  try {
    const Group = await GroupModel.findOne({ _id: groupId });
    if (!Group) {
      return res.json({ message: "Group not Found", success: false });
    }
    const Product = await ProductModel.findOne({ _id: productId });
    if (!Product) {
      return res.json({ message: "Proudct not Found", success: false });
    }
    await ProductModel.deleteOne({ _id: productId });
    // await ProductModel.save();
    Group.AllProducts = await Group.AllProducts.filter(
      (item) => item !== productId
    );

    await UserModel.updateMany(
      { _id: { $in: Group.Allusers } },
      { $pull: { AllProducts: productId } },
      { new: true }
    );

    await Group.save();
    return res.json({ message: "Product removed", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "somethign went wrong" });
  }
};
