import mongoose from "mongoose";

const GroupSchema = mongoose.Schema({
  GroupName: {
    type: String,
    required: true,
  },
  Allusers: [
    {
      userId: {
        type: mongoose.Types.ObjectId,
        ref: "Users",
      },
      role: {
        type: String,
        enum: ["admin", "member"],
        default: "member",
      },
    },
  ],
  createdby: {
    type: mongoose.Types.ObjectId,
    ref: "Users",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  AllProducts: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Products",
    },
  ],
});

export default mongoose.models.Groups || mongoose.model("Groups", GroupSchema);