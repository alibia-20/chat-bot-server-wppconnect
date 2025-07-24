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
exports.createProductElement = createProductElement;
const NewProduct_1 = __importDefault(require("../../models/NewProduct"));
const ProductElement_1 = __importDefault(require("../../models/ProductElement"));
function createProductElement(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { keyword, name, createdBy, elements, idPostFacebook, synonym } = req.body;
            console.log("les donne du produit", req.body);
            const files = req.files;
            const parsedElements = JSON.parse(elements); // Tableau d’objets { type, content, caption, order, imageIndex }
            // 🔹 Création du produit
            const product = yield NewProduct_1.default.create({
                keyword,
                name,
                createdBy,
                idPostFacebook,
                synonym,
            });
            // 🔹 Construction des éléments
            for (const el of parsedElements) {
                if (el.type === "image") {
                    const imageFile = files[el.imageIndex]; // 👈 Index correspond à l'ordre des images dans FormData
                    yield ProductElement_1.default.create({
                        productId: product.id,
                        type: "image",
                        caption: el.caption,
                        imageUrl: imageFile ? `/images/products/${imageFile.filename}` : null,
                        order: el.order,
                    });
                }
                else if (el.type === "text") {
                    yield ProductElement_1.default.create({
                        productId: product.id,
                        type: "text",
                        content: el.content,
                        order: el.order,
                    });
                }
            }
            res
                .status(201)
                .json({ message: "Produit créé avec succès", productId: product.id });
        }
        catch (err) {
            console.error("Erreur création produit :", err);
            res.status(500).json({ message: "Erreur serveur", error: err });
        }
    });
}
