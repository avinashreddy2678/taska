import { Router } from "express";
import {
  AddPeopletoGroup,
  CreateGroup,
  deleteGroupbyAdmin,
  getUserDetailsfromGroup,
  getUserOfGroup,
  leaveFromGroup,
} from "../Controller/groupController.js";

const router = Router();


router.get("/get-AllUsers",getUserOfGroup)



router.post("/create", CreateGroup);
router.put("/addpeople", AddPeopletoGroup);
router.get("/group-members", getUserDetailsfromGroup);
router.delete("/admin-delete",deleteGroupbyAdmin);
router.delete("/user-leave",leaveFromGroup)

export { router as GroupRouter };
