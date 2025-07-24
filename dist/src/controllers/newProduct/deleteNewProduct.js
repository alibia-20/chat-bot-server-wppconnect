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
exports.deleteNewProduct = deleteNewProduct;
const NewProduct_1 = __importDefault(require("../../models/NewProduct"));
const ProductElement_1 = __importDefault(require("../../models/ProductElement"));
function deleteNewProduct(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            // 🔹 Vérifie si le produit existe
            const product = yield NewProduct_1.default.findByPk(id);
            if (!product) {
                res.status(404).json({ message: "Produit non trouvé" });
                return;
            }
            // 🔹 Supprime d'abord tous les éléments liés
            yield ProductElement_1.default.destroy({
                where: { productId: id },
            });
            // 🔹 Puis supprime le produit
            yield product.destroy();
            res.status(200).json({ message: "Produit supprimé avec succès" });
        }
        catch (err) {
            console.error("Erreur lors de la suppression du produit :", err);
            res.status(500).json({ message: "Erreur serveur", error: err });
        }
    });
}
