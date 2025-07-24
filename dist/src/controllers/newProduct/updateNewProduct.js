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
exports.updateNewProduct = updateNewProduct;
const NewProduct_1 = __importDefault(require("../../models/NewProduct"));
const ProductElement_1 = __importDefault(require("../../models/ProductElement"));
function updateNewProduct(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id, name, createdBy, elements, keyword, idPostFacebook, synonym } = req.body;
            const files = req.files || [];
            const parsedElements = JSON.parse(elements); // [{id?, type, content, caption, order, imageUrl}]
            // Vérifie si le produit existe
            const product = yield NewProduct_1.default.findByPk(id);
            if (!product) {
                res.status(404).json({ message: "Produit non trouvé" });
                return;
            }
            // Mise à jour des infos du produit
            yield product.update({ name, createdBy, keyword, idPostFacebook, synonym });
            // Récupère les éléments existants
            const existingElements = yield ProductElement_1.default.findAll({ where: { productId: id } });
            const existingIds = existingElements.map(el => el.id);
            // Pour suivre les fichiers images uploadés
            let imageFileIndex = 0;
            // Gérer update/ajout
            for (const el of parsedElements) {
                if (el.type === "image") {
                    if (el.id && existingIds.includes(el.id)) {
                        // Modification d'une image existante
                        let imageUrl = el.imageUrl;
                        if (el.fileReplace) { // Champ custom côté client pour signaler remplacement
                            const imageFile = files[imageFileIndex++];
                            imageUrl = imageFile ? `/images/products/${imageFile.filename}` : el.imageUrl;
                        }
                        yield ProductElement_1.default.update({
                            caption: el.caption,
                            imageUrl,
                            order: el.order,
                        }, { where: { id: el.id } });
                    }
                    else {
                        // Nouvelle image
                        const imageFile = files[imageFileIndex++];
                        yield ProductElement_1.default.create({
                            productId: id,
                            type: "image",
                            caption: el.caption,
                            imageUrl: imageFile ? `/images/products/${imageFile.filename}` : null,
                            order: el.order,
                        });
                    }
                }
                else if (el.type === "text") {
                    if (el.id && existingIds.includes(el.id)) {
                        // Modification d'un texte existant
                        yield ProductElement_1.default.update({
                            content: el.content,
                            order: el.order,
                        }, { where: { id: el.id } });
                    }
                    else {
                        // Nouveau texte
                        yield ProductElement_1.default.create({
                            productId: id,
                            type: "text",
                            content: el.content,
                            order: el.order,
                        });
                    }
                }
            }
            // Suppression des éléments retirés côté client
            const sentIds = parsedElements.filter((e) => e.id).map((e) => e.id);
            const toDelete = existingElements.filter((e) => !sentIds.includes(e.id));
            for (const el of toDelete) {
                yield el.destroy();
            }
            res.status(200).json({ message: "Produit mis à jour avec succès" });
        }
        catch (err) {
            console.error("Erreur lors de la mise à jour du produit :", err);
            res.status(500).json({ message: "Erreur serveur", error: err });
        }
    });
}
