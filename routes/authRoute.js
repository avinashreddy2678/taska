import { Router } from "express";
import { Signin, Signup, verifyOtp } from "../Controller/authController.js";

const router = Router();

router.post("/signup", Signup);
router.post("/signin", Signin);
router.post("/verify-otp",verifyOtp)

export { router as AuthRoute };
