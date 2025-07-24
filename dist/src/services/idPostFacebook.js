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
exports.sendProductByFacebookId = sendProductByFacebookId;
const models_1 = require("../models");
const humanSleep_1 = __importDefault(require("../utils/humanSleep"));
function sendProductByFacebookId(clientInstance, senderId, idPostFacebook) {
    return __awaiter(this, void 0, void 0, function* () {
        const product = yield models_1.NewProduct.findOne({
            where: { idPostFacebook },
            include: [{ model: models_1.ProductElement, as: "elements" }],
        });
        if (!product) {
            console.log("⚠️ Aucun produit ne correspond à cet ID Facebook :", idPostFacebook);
            return false;
        }
        console.log(`📦 Produit trouvé via ID Facebook : ${product.name}`);
        const sortedElements = (product.elements || []).sort((a, b) => { var _a, _b; return ((_a = a.order) !== null && _a !== void 0 ? _a : 0) - ((_b = b.order) !== null && _b !== void 0 ? _b : 0); });
        for (const element of sortedElements) {
            yield (0, humanSleep_1.default)();
            if (element.type === "text" && element.content) {
                yield clientInstance.sendText(senderId, element.content);
            }
            if (element.type === "image" && typeof element.imageUrl === "string" && element.imageUrl) {
                const fullImageUrl = element.imageUrl.startsWith("/")
                    ? `${process.env.BASE_URL}${element.imageUrl}`
                    : `${process.env.BASE_URL}/${element.imageUrl}`;
                yield clientInstance.sendImage(senderId, fullImageUrl, "image.jpg", element.caption || "");
            }
        }
        return true;
    });
}
