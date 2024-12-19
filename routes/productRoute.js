import { Router } from "express";
import {
  changeProductStatus,
  CreateProduct,
  editProductdetails,
  getAllGroupProducts,
} from "../Controller/productController.js";

const router = Router();

router.get("/allgroup-products", getAllGroupProducts);

router.post("/create", CreateProduct);
router.put("/change-status", changeProductStatus);

router.put("/edit", editProductdetails);

export { router as ProductRouter };
