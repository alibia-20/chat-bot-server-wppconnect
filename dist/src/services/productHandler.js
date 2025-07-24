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
exports.default = handleProduct;
const models_1 = require("../models");
const humanSleep_1 = __importDefault(require("../utils/humanSleep"));
const remove_accents_1 = __importDefault(require("remove-accents"));
function normalizeText(text) {
    return (0, remove_accents_1.default)(text).toLowerCase();
}
function splitWords(text) {
    return text
        .replace(/[^\w\s]/g, "") // enlever ponctuation
        .split(/\s+/)
        .filter(Boolean);
}
function handleProduct(clientInstance, senderId, rawText) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const normalizedText = normalizeText(rawText);
        const messageWords = splitWords(normalizedText);
        console.log("🧹 Message normalisé :", normalizedText);
        console.log("🔍 Mots extraits du message :", messageWords);
        const allProducts = yield models_1.NewProduct.findAll({
            include: [{ model: models_1.ProductElement, as: "elements" }],
        });
        const matchedProducts = [];
        for (const product of allProducts) {
            const rawKeywords = [product.keyword, ...(((_a = product.synonym) === null || _a === void 0 ? void 0 : _a.split(/[,;|]+/)) || [])];
            const keywords = rawKeywords.map((kw) => normalizeText(kw.trim())).filter(Boolean);
            let matched = false;
            for (const keyword of keywords) {
                if (keyword.includes(" ")) {
                    // 🔍 Cas d’un mot-clé composé (avec espace)
                    if (normalizedText.includes(keyword)) {
                        matched = true;
                        break;
                    }
                }
                else {
                    // 🔍 Cas d’un mot-clé simple
                    if (messageWords.includes(keyword)) {
                        matched = true;
                        break;
                    }
                }
            }
            if (matched) {
                matchedProducts.push(product);
                console.log(`✅ Produit trouvé pour mot clé/synonyme dans message : ${product.keyword}`);
            }
        }
        if (matchedProducts.length === 0) {
            console.log("❌ Aucun produit ne correspond au message.");
            return false;
        }
        for (const product of matchedProducts) {
            if (Array.isArray(product.elements)) {
                const sortedElements = product.elements.sort((a, b) => { var _a, _b; return ((_a = a.order) !== null && _a !== void 0 ? _a : 0) - ((_b = b.order) !== null && _b !== void 0 ? _b : 0); });
                for (const element of sortedElements) {
                    yield (0, humanSleep_1.default)();
                    if (element.type === "text" && element.content) {
                        yield clientInstance.sendText(senderId, element.content);
                    }
                    if (element.type === "image" &&
                        typeof element.imageUrl === "string" &&
                        element.imageUrl) {
                        const fullImageUrl = element.imageUrl.startsWith("/")
                            ? `${process.env.BASE_URL}${element.imageUrl}`
                            : `${process.env.BASE_URL}/${element.imageUrl}`;
                        yield clientInstance.sendImage(senderId, fullImageUrl, "image.jpg", element.caption || "");
                    }
                }
            }
            console.log(`📦 Infos envoyées pour produit : ${product.keyword}`);
        }
        return true;
    });
}
