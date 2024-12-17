import { Router } from "express";
import {
  changeProductStatus,
  CreateProduct,
  getAllGroupProducts,
} from "../Controller/productController.js";

const router = Router();


router.get('/allgroup-products',getAllGroupProducts);

router.post("/create", CreateProduct);
router.put("/change-status", changeProductStatus);

export { router as ProductRouter };
