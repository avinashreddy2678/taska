import { Router } from "express";
import { ResendOtp, Signin, Signup, verifyOtp } from "../Controller/authController.js";

const router = Router();

router.post("/signup", Signup);
router.post("/signin", Signin);
router.post("/verify-otp",verifyOtp);
router.get("/resend-otp",ResendOtp)

export { router as AuthRoute };
