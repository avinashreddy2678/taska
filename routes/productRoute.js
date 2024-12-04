import { Router } from "express";
import { CreateProduct } from "../Controller/productController.js";

const router = Router();

router.post("/create", CreateProduct);

export { router as ProductRouter };
