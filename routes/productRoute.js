import { Router } from "express";
import {
  changeProductStatus,
  CreateProduct,
} from "../Controller/productController.js";

const router = Router();

router.post("/create", CreateProduct);
router.put("/change-status", changeProductStatus);

export { router as ProductRouter };
