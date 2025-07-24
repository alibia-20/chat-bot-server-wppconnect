"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.initializeWppClient = void 0;
const wppconnect = __importStar(require("@wppconnect-team/wppconnect"));
const index_1 = require("../index");
const Contact_1 = __importDefault(require("../models/Contact"));
const humanSleep_1 = __importDefault(require("../utils/humanSleep"));
const messageHandler_1 = require("../services/messageHandler");
let clientInstance;
let isInitializing = false;
const initializeWppClient = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (clientInstance) {
        console.log("✅ Client WhatsApp déjà initialisé");
        return clientInstance;
    }
    if (isInitializing) {
        console.log("⏳ Initialisation déjà en cours...");
        return null;
    }
    try {
        isInitializing = true;
        console.log("🔄 Démarrage de l'initialisation du client WhatsApp...");
        const create = (_a = wppconnect.create) !== null && _a !== void 0 ? _a : (_b = wppconnect.default) === null || _b === void 0 ? void 0 : _b.create;
        clientInstance = yield create({
            session: "default",
            catchQR: (base64Qr) => {
                const cleanBase64 = base64Qr.replace("data:image/png;base64,", "");
                index_1.io.emit("qrCode", cleanBase64);
            },
            statusFind: (statusSession) => {
                console.log("📶 Statut de la session:", statusSession);
                index_1.io.emit("status", statusSession);
            },
            headless: true,
            useChrome: true,
            browserArgs: ["--no-sandbox"],
            puppeteerOptions: { args: ["--no-sandbox"] },
        });
        isInitializing = false;
        console.log("✅ WPPConnect client prêt.");
        clientInstance.onStateChange((state) => {
            console.log("📱 État du client WhatsApp:", state);
            if (state === "DISCONNECTED") {
                console.log("🔁 Reconnexion en cours...");
                setTimeout(() => (0, exports.initializeWppClient)().catch(console.error), 5000);
            }
        });
        clientInstance.onMessage((message) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const senderId = message.from;
            const phoneNumber = senderId.split("@")[0];
            const rawText = message.body || "";
            // Ignore messages de groupe ici
            if (message.isGroupMsg) {
                console.log("📛 Message de groupe ignoré dans le client principal");
                return;
            }
            console.log("📩 Message reçu de", phoneNumber, ":", rawText);
            yield (0, humanSleep_1.default)();
            try {
                // Enregistrer nouveau contact si besoin
                const existingContact = yield Contact_1.default.findOne({ where: { phone: phoneNumber } });
                if (!existingContact) {
                    yield Contact_1.default.create({
                        phone: phoneNumber,
                        name: ((_a = message.sender) === null || _a === void 0 ? void 0 : _a.pushname) || "Inconnu",
                        firstMessageAt: new Date(),
                    });
                    console.log("👤 Nouveau contact enregistré:", phoneNumber);
                    //   await scheduleReminderMessage(clientInstance, phoneNumber);
                }
                // Déléguer le traitement du message
                yield (0, messageHandler_1.handleIncomingMessage)(clientInstance, message);
            }
            catch (err) {
                console.error("❌ Erreur traitement du message :", err);
            }
        }));
        return clientInstance;
    }
    catch (error) {
        console.error("❌ Erreur d'initialisation de WPPConnect :", error);
        isInitializing = false;
        throw error;
    }
});
exports.initializeWppClient = initializeWppClient;
