import { Router } from "express";
import { createProductElement } from "../controllers/newProduct/createProductElement";
import { getAllProduct } from "../controllers/newProduct/getAllProduct";
import { deleteNewProduct } from "../controllers/newProduct/deleteNewProduct";
import { updateNewProduct } from "../controllers/newProduct/updateNewProduct";
import upload from "../utils/multerConfig"; // Importer Multer
import { getNewProductById } from "../controllers/newProduct/getNewProductById";

const router = Router();
router.post("/newproducts", upload.array("images", 10), createProductElement);
router.get("/newproducts", getAllProduct);
router.delete("/newproducts/:id", deleteNewProduct);
router.put("/newproducts/:id", upload.array("images", 10), updateNewProduct);
router.get("/newproducts/:id", getNewProductById);
export default router;
