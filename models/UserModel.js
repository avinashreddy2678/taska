import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  AllGroups: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Groups",
    },
  ],
  alertBefore: {
    type: Number,
    default: 3,
  },
  deleteAfter: {
    type: Number,
    default: 7,
  },
  createdAt: {
    type: Date,
  },
});

export default mongoose.models.Users || mongoose.model("Users", UserSchema);
