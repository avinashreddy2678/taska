import mongoose from "mongoose";

const NotifySchema = mongoose.Schema({
  groupid: {
    type: mongoose.Types.ObjectId,
    ref: "Groups",
  },
  message: {
    type: String,
    required: true,
  },
  sentBy: {
    type: mongoose.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  expiresIn: {
    type: Date,
    required: true,
    index: { expiresIn: 0 },
  },
});

export default mongoose.models.Notify || mongoose.model("Notify", NotifySchema);
