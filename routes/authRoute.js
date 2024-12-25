import { Router } from "express";
import {
  handleLogout,
  ResendOtp,
  Signin,
  Signup,
  userUpdates,
  verifyOtp,
} from "../Controller/authController.js";
import { VerifyUser } from "../middleware/verifyUser.js";

const router = Router();

router.post("/signup", Signup);
router.post("/signin", Signin);
router.post("/verify-otp", verifyOtp);
router.get("/resend-otp", ResendOtp);
router.get("/user-updates", userUpdates);
router.post("/logout", VerifyUser, handleLogout);

export { router as AuthRoute };
