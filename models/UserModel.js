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
  createdAt: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: new Date(),
  },
  isSubscribed: {
    type: Boolean,
    default: false,
  },
  SubscribeUpto: {
    type: Date,
  },
});

export default mongoose.models.Users || mongoose.model("Users", UserSchema);
