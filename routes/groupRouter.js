import { Router } from "express";
import {
  AddPeopletoGroup,
  CreateGroup,
  getUserDetailsfromGroup,
} from "../Controller/groupController.js";

const router = Router();

router.post("/create", CreateGroup);
router.put("/addpeople", AddPeopletoGroup);
router.get("/group-members", getUserDetailsfromGroup);

export { router as GroupRouter };
