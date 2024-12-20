import mongoose from "mongoose";

const verificationTableScehma = mongoose.Schema({
  email: {
    type: String,
  },
  otp: {
    type: Number,
  },
  expiresIn: {
    type: Date,
  },
});

export default mongoose.models.verificationTable ||
  mongoose.model("verificationTable", verificationTableScehma);
