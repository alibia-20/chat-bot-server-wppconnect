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
exports.handleIncomingMessage = void 0;
const faqHandler_1 = require("./faqHandler");
const productHandler_1 = __importDefault(require("./productHandler"));
const handleIncomingProductMessage_1 = require("../config/utils/handleIncomingProductMessage");
const handleIncomingMessage = (clientInstance, message) => __awaiter(void 0, void 0, void 0, function* () {
    const FacebookMessages = message;
    const senderId = message.from;
    const rawText = message.body || "";
    const cleanText = rawText.replace(/[^\w\s]/gi, "").toLowerCase();
    if (FacebookMessages.ctwaContext) {
        // 🔍 Vérification si le message contient un lien Facebook
        const ctwaContext = FacebookMessages.ctwaContext || {};
        yield (0, handleIncomingProductMessage_1.handleIncomingProductMessage)(ctwaContext, senderId, clientInstance);
        // Si c'est un lien Facebook, on le traite
        console.log("📎 Lien Facebook traité.");
        return;
    }
    // Traitement spécial liens Facebook
    if (rawText.includes("fb.me")) {
        console.log(rawText, "📎 Lien Facebook start traitement.");
        // TODO: traitement spécifique des liens Facebook
        return;
    }
    // Traitement groupe (exemple, à étendre)
    if (message.isGroupMsg) {
        console.log("📛 Message de groupe reçu, traitement spécifique à faire.");
        // TODO: traitement groupe
        return;
    }
    // Traitement FAQ
    const faqResult = yield (0, faqHandler_1.handleFaq)(clientInstance, senderId, cleanText);
    if (faqResult)
        return; // réponse envoyée
    // Traitement Produits
    const productResult = yield (0, productHandler_1.default)(clientInstance, senderId, cleanText);
    if (productResult)
        return; // réponse envoyée
    console.log("❌ Aucun traitement applicable pour ce message.");
});
exports.handleIncomingMessage = handleIncomingMessage;
