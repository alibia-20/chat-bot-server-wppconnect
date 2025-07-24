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
exports.handleFaq = void 0;
const FAQ_1 = __importDefault(require("../models/FAQ"));
const remove_accents_1 = __importDefault(require("remove-accents"));
function normalizeText(text) {
    return (0, remove_accents_1.default)(text).toLowerCase();
}
function splitWords(text) {
    return text
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(Boolean)
        .filter(w => w.length >= 5);
}
const handleFaq = (clientInstance, senderId, rawText) => __awaiter(void 0, void 0, void 0, function* () {
    const normalizedText = normalizeText(rawText);
    const messageWords = splitWords(normalizedText);
    console.log("🧹 Texte FAQ normalisé :", normalizedText);
    console.log("🔍 Mots FAQ extraits :", messageWords);
    const allFaqs = yield FAQ_1.default.findAll();
    // Trouve les FAQ dont la question contient au moins un mot du message
    const matchedFaqs = allFaqs.filter(faq => {
        const normalizedQuestion = normalizeText(faq.question);
        return messageWords.some(word => normalizedQuestion.includes(word));
    });
    if (matchedFaqs.length === 0) {
        console.log("❌ Aucune FAQ correspondante trouvée.");
        return false;
    }
    const faqMatches = matchedFaqs.slice(0, 3);
    const combinedAnswer = faqMatches
        .map((faq) => `🟢 ${faq.answer}`)
        .join("\n\n");
    yield clientInstance.sendText(senderId, combinedAnswer);
    console.log(`🤖 ${faqMatches.length} réponse(s) FAQ envoyée(s)`);
    return true;
});
exports.handleFaq = handleFaq;
