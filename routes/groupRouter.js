import { Router } from "express";
import {
  AddPeopletoGroup,
  CreateGroup,
} from "../Controller/groupController.js";

const router = Router();

router.post("/create", CreateGroup);
router.put("/addpeople", AddPeopletoGroup);

export { router as GroupRouter };
