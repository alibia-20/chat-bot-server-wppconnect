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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewProductById = getNewProductById;
const models_1 = require("../../models");
function getNewProductById(req, // ✅ ici on précise que les params contiennent un id
res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const product = yield models_1.NewProduct.findByPk(id, {
                include: [
                    {
                        model: models_1.ProductElement,
                        as: "elements",
                    },
                ],
                order: [["elements", "order", "ASC"]],
            });
            if (!product) {
                res.status(404).json({ message: "Produit non trouvé" });
                return;
            }
            res.status(200).json(product);
        }
        catch (error) {
            console.error("Erreur lors de la récupération du produit :", error);
            res.status(500).json({ message: "Erreur serveur", error });
        }
    });
}
