import { Router } from "express";
import { ResendOtp, Signin, Signup, userUpdates, verifyOtp } from "../Controller/authController.js";

const router = Router();

router.post("/signup", Signup);
router.post("/signin", Signin);
router.post("/verify-otp",verifyOtp);
router.get("/resend-otp",ResendOtp);
router.get("/user-updates",userUpdates)


export { router as AuthRoute };
