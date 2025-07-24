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
exports.default = resolveFacebookReel;
// src/services/resolveFacebookReel.ts
const axios_1 = __importDefault(require("axios"));
const puppeteer_1 = __importDefault(require("puppeteer"));
// 🔎 Extrait la première URL trouvée dans un texte
function extractLink(input) {
    const regex = /(https?:\/\/[^\s]+)/;
    const match = input.match(regex);
    return match ? match[0] : null;
}
// 🔄 Résout les liens /reel/... en lien vidéo classique avec Puppeteer
function resolveFacebookReelWithPuppeteer(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const browser = yield puppeteer_1.default.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
            const page = yield browser.newPage();
            yield page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                "(KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36");
            yield page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });
            yield new Promise(res => setTimeout(res, 2000));
            const ogUrl = yield page.$eval('meta[property="og:url"]', el => el.getAttribute("content"));
            yield browser.close();
            if (ogUrl && ogUrl.includes("/videos/")) {
                return ogUrl;
            }
            return null;
        }
        catch (error) {
            console.error("❌ Erreur Puppeteer :", error.message);
            return null;
        }
    });
}
// 🧠 Fonction principale exportée
function resolveFacebookReel(shortLink) {
    return __awaiter(this, void 0, void 0, function* () {
        const extractedLink = extractLink(shortLink);
        if (!extractedLink) {
            console.log("❌ Aucun lien détecté.");
            return null;
        }
        let longLink;
        // Étape 1 : Suivre les redirections (si lien court comme fb.me)
        try {
            const response = yield axios_1.default.head(extractedLink, { maxRedirects: 10 });
            longLink = response.request.res.responseUrl;
        }
        catch (error) {
            console.log("⚠️ Axios a échoué, fallback Puppeteer...");
            const fallback = yield resolveFacebookReelWithPuppeteer(extractedLink);
            if (!fallback)
                return null;
            longLink = fallback;
        }
        console.log("🔗 Lien long résolu :", longLink);
        // Étape 2 : Si c’est un reel, le résoudre avec Puppeteer
        if (longLink.includes("/reel/")) {
            console.log("🔁 Lien 'reel' détecté, résolution avec Puppeteer...");
            const resolved = yield resolveFacebookReelWithPuppeteer(longLink);
            if (resolved) {
                longLink = resolved;
                console.log("🎯 Vidéo trouvée via Puppeteer :", longLink);
            }
            else {
                console.log("❌ Résolution reel échouée.");
                return null;
            }
        }
        // Étape 3 : Extraire l’URL de vidéo finale
        const regex = /facebook\.com\/(\d+)\/videos\/(?:[^/]+\/)?(\d+)/;
        const match = longLink.match(regex);
        if (!match) {
            console.log("❌ Impossible d'extraire pageId et videoId.");
            return null;
        }
        const pageId = match[1];
        const videoId = match[2];
        const formattedUrl = `https://www.facebook.com/${pageId}/videos/${videoId}/`;
        return formattedUrl;
    });
}
