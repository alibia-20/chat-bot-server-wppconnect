"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const createProductElement_1 = require("../controllers/newProduct/createProductElement");
const getAllProduct_1 = require("../controllers/newProduct/getAllProduct");
const deleteNewProduct_1 = require("../controllers/newProduct/deleteNewProduct");
const updateNewProduct_1 = require("../controllers/newProduct/updateNewProduct");
const multerConfig_1 = __importDefault(require("../utils/multerConfig")); // Importer Multer
const getNewProductById_1 = require("../controllers/newProduct/getNewProductById");
const router = (0, express_1.Router)();
router.post("/newproducts", multerConfig_1.default.array("images", 10), createProductElement_1.createProductElement);
router.get("/newproducts", getAllProduct_1.getAllProduct);
router.delete("/newproducts/:id", deleteNewProduct_1.deleteNewProduct);
router.put("/newproducts/:id", multerConfig_1.default.array("images", 10), updateNewProduct_1.updateNewProduct);
router.get("/newproducts/:id", getNewProductById_1.getNewProductById);
exports.default = router;
