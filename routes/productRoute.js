import { Router } from "express";
import {
  changeProductStatus,
  CreateProduct,
  deleteProduct,
  editProductdetails,
  getAllGroupProducts,
} from "../Controller/productController.js";

const router = Router();

router.get("/allgroup-products", getAllGroupProducts);

router.post("/create", CreateProduct);
router.put("/change-status", changeProductStatus);

router.put("/edit", editProductdetails);
router.delete("/delete-product",deleteProduct);

export { router as ProductRouter };
