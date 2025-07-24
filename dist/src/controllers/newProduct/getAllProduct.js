"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProduct = getAllProduct;
const NewProduct_1 = __importDefault(require("../../models/NewProduct"));
const ProductElement_1 = __importDefault(require("../../models/ProductElement"));
function getAllProduct(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 🔹 Récupération de tous les produits
            const products = yield NewProduct_1.default.findAll();
            // 🔹 Récupération des éléments pour chaque produit
            const productsWithElements = yield Promise.all(products.map((product) => __awaiter(this, void 0, void 0, function* () {
                const elements = yield ProductElement_1.default.findAll({
                    where: { productId: product.id },
                    order: [["order", "ASC"]],
                });
                return Object.assign(Object.assign({}, product.toJSON()), { elements });
            })));
            res.status(200).json(productsWithElements);
        }
        catch (err) {
            console.error("Erreur récupération des produits :", err);
            res.status(500).json({ message: "Erreur serveur", error: err });
        }
    });
}
