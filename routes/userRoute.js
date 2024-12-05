import { Router } from "express";
import { searchUsers } from "../Controller/otherUserController";

const router = Router();

router.get("/search-users", searchUsers);

export { router as userDetailRouter };
