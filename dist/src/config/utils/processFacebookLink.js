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
const axios_1 = __importDefault(require("axios"));
function processFacebookLink(shortLink) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("📎 Lien extrait :", shortLink);
        if (!shortLink) {
            console.error("❌ Aucun lien n’a pu être extrait du message.");
            return null;
        }
        try {
            const response = yield axios_1.default.get(shortLink, {
                maxRedirects: 10,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
                },
            });
            const longLink = response.request.res.responseUrl;
            console.log("🔗 Lien long récupéré :", longLink);
            // Exemple : https://www.facebook.com/61561441996256/videos/671735108573931/
            const regex = /facebook\.com\/(\d+)\/videos\/(\d+)/;
            const match = longLink.match(regex);
            console.log("🔎 Identifiants extracts  match:", match);
            if (match) {
                const pageId = match[1];
                const videoId = match[2];
                const formattedId = `${pageId}_${videoId}`;
                return { longLink, formattedId };
            }
            throw new Error("Les identifiants n'ont pas pu être extraits du lien long.");
        }
        catch (error) {
            console.error("❌ Erreur lors de la résolution du lien :", error.message);
            return null;
        }
    });
}
exports.default = processFacebookLink;
