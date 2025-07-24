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
exports.handleIncomingProductMessage = void 0;
const processFacebookLink_1 = __importDefault(require("../../services/processFacebookLink"));
const getProductIdFromPages_1 = __importDefault(require("../../services/getProductIdFromPages"));
const idPostFacebook_1 = require("../../services/idPostFacebook");
const productHandler_1 = __importDefault(require("../../services/productHandler"));
const baseImageUrl = "https://ec5546b610ae.ngrok-free.app"; // ✅ Remplace par ton vrai domaine
// Fonction pour délai aléatoire entre 1.5s et 4s
const humanSleep = () => __awaiter(void 0, void 0, void 0, function* () {
    const delay = Math.floor(Math.random() * 2500) + 1500;
    return new Promise((resolve) => setTimeout(resolve, delay));
});
const handleIncomingProductMessage = (ctwaContext, senderPhone, client) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("📨 Message reçu :", ctwaContext);
        const sourceUrl = ctwaContext.sourceUrl || "";
        const description = ctwaContext.description || "";
        // 🖨️ Logs pour débogage clair
        console.log("🧩 Détails du CTWA context reçu :");
        // (reste du traitement...)
        const result = yield (0, processFacebookLink_1.default)(sourceUrl);
        if (!result) {
            console.log("❌ Aucun ID Facebook trouvé.");
            return;
        }
        console.log("🔗 Lien long :", result.longLink);
        console.log("🆔 ID formaté :", result.formattedId);
        // 📦 Étape 2 : Vérifier si le produit existe sur Facebook
        const productIdWithPageName = yield (0, getProductIdFromPages_1.default)(result.formattedId);
        if (productIdWithPageName) {
            console.log("📦 ID :", productIdWithPageName === null || productIdWithPageName === void 0 ? void 0 : productIdWithPageName.id);
            console.log("📝 description :", description);
            // 1. Essayer par ID Facebook
            const foundById = yield (0, idPostFacebook_1.sendProductByFacebookId)(client, senderPhone, productIdWithPageName.id);
            if (!foundById) {
                // 2. Sinon chercher par mots clés / synonymes dans la description
                const foundByKeywords = yield (0, productHandler_1.default)(client, senderPhone, description);
                if (!foundByKeywords) {
                    console.log("🚫 Aucun produit trouvé ni par ID Facebook ni par mots-clés");
                }
            }
        }
    }
    catch (error) {
        console.error("❌ Erreur dans handleIncomingProductMessage :", error);
    }
});
exports.handleIncomingProductMessage = handleIncomingProductMessage;
