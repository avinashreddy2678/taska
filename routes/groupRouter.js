import { Router } from "express";
import {
  AddPeopletoGroup,
  CreateGroup,
  deleteGroupbyAdmin,
  getUserDetailsfromGroup,
  getUserOfGroup,
  leaveFromGroup,
  removeUserbyAdmin,
} from "../Controller/groupController.js";

const router = Router();

router.get("/get-AllUsers", getUserOfGroup);

router.post("/create", CreateGroup);
router.put("/addpeople", AddPeopletoGroup);
router.get("/group-members", getUserDetailsfromGroup);
router.delete("/admin-delete", deleteGroupbyAdmin);
router.delete("/user-leave", leaveFromGroup);
router.delete("/remove-byadmin",removeUserbyAdmin)

export { router as GroupRouter };
