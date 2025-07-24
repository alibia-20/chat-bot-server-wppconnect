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
const resolveFacebookReel_1 = __importDefault(require("./resolveFacebookReel"));
function extractLink(input) {
    const regex = /(https?:\/\/[^\s]+)/;
    const match = input.match(regex);
    return match ? match[0] : null;
}
function processFacebookLink(input) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const extractedLink = extractLink(input);
        if (!extractedLink) {
            console.log("❌ Aucun lien détecté.");
            return null;
        }
        try {
            // 🔁 Suivre les redirections (fb.me, l.php, login/?next, etc.)
            let longLink = extractedLink;
            const headResponse = yield axios_1.default.head(extractedLink, {
                maxRedirects: 10,
                timeout: 8000,
            });
            if ((_b = (_a = headResponse === null || headResponse === void 0 ? void 0 : headResponse.request) === null || _a === void 0 ? void 0 : _a.res) === null || _b === void 0 ? void 0 : _b.responseUrl) {
                longLink = headResponse.request.res.responseUrl;
                console.log("🔗 Lien long résolu :", longLink);
            }
            // 🧼 Extraire lien s’il est encodé dans login/?next ou l.php?u=
            const url = new URL(longLink);
            const encodedNext = url.searchParams.get("next") || url.searchParams.get("u");
            if (encodedNext) {
                longLink = decodeURIComponent(encodedNext);
                console.log("🔁 Lien décodé depuis next/u= :", longLink);
            }
            // 🔍 Si c’est un reel, le résoudre via ta fonction custom
            if (longLink.includes("/reel/")) {
                const resolved = yield (0, resolveFacebookReel_1.default)(longLink);
                if (resolved) {
                    longLink = resolved;
                    console.log("🎞️ Reel résolu :", longLink);
                }
            }
            // ✅ Regex de matching
            const regexPatterns = [
                /story_fbid=(\d+)&id=(\d+)/,
                /permalink\.php\?story_fbid=(\d+)&id=(\d+)/,
                /facebook\.com\/(?:\w+|\d+)\/posts\/(\d+)/,
                /facebook\.com\/(?:\w+|\d+)\/videos\/(?:\w+\/)?(\d+)/,
                /facebook\.com\/watch\/?\?v=(\d+)/,
                /facebook\.com\/watch\/live\/?\?v=(\d+)/,
                /photo\.php\?fbid=(\d+)&id=(\d+)/,
                /facebook\.com\/(?:\w+|\d+)\/photos\/(\d+)/,
                /facebook\.com\/reel\/(\d+)/,
                /facebook\.com\/[^\/]+\/reels\/(\d+)/,
            ];
            let pageId = null;
            let postId = null;
            for (const regex of regexPatterns) {
                const match = longLink.match(regex);
                if (match) {
                    if (regex.source.includes("story_fbid") || regex.source.includes("fbid") || regex.source.includes("id=")) {
                        postId = match[1];
                        pageId = match[2] || "unknown"; // fallback
                    }
                    else {
                        postId = match[1];
                        const possiblePage = longLink.match(/facebook\.com\/([\w\d\.]+)/);
                        pageId = possiblePage ? possiblePage[1] : "unknown";
                    }
                    break;
                }
            }
            if (!pageId || !postId || pageId === "unknown") {
                console.log("❌ Impossible d'extraire un ID de page valide.");
                return null;
            }
            const formattedId = `${pageId}_${postId}`;
            console.log("✅ Identifiant formaté :", formattedId);
            return { longLink, formattedId };
        }
        catch (error) {
            console.error("🚨 Erreur lors du traitement du lien :", error.message);
            return null;
        }
    });
}
exports.default = processFacebookLink;
