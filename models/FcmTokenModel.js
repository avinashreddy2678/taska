import mongoose from "mongoose";

const FcmModel = mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "Users",
  },
  fcmToken: {
    type: String,
  },
  lastUpdated: {
    type: Date,
  },
});

export default mongoose.models.Fcms || mongoose.model("Fcm", FcmModel);
