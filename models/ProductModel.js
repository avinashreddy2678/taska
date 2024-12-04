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
});

export default mongoose.models.Products ||
  mongoose.model("Products", ProductSchema);
