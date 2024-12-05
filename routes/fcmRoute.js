import { Router } from "express";
import { SaveFcmToken } from "../Controller/fcmController";

const router = Router();

router.post("/save-token", SaveFcmToken);

export {router as fcmRouter}