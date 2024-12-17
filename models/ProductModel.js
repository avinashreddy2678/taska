import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  addedby: {
    type: mongoose.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  barCodeId: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
    default: 1,
  },
  expirydate: {
    type: Date,
    required: true,
  },
  groupId: {
    type: mongoose.Types.ObjectId,
    ref: "Groups",
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  status: {
    type: String,
    enum: ["consumed", "Trashed", "toExpired"],
    default: "toExpired",
  },
});

export default mongoose.models.Products ||
  mongoose.model("Products", ProductSchema);
