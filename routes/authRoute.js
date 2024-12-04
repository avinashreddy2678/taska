import { Router } from "express";
import { Signin, Signup } from "../Controller/authController.js";

const router = Router();

router.post("/signup", Signup);
router.post("/signin", Signin);

export { router as AuthRoute };
