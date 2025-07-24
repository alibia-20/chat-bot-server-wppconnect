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
exports.AdminMiddleware = exports.AuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
dotenv_1.default.config(); // Charger les variables d'environnement
const SECRET_KEY = process.env.JWT_SECRET ||
    "c480d778c8e612ee004c25d62af12405da22359c28967c90f4145760987dd19c"; // Clé par défaut (à éviter en production)
const AuthMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        console.log("Token reçu:", token); // Log activé pour déboguer
        if (!token) {
            res.status(401).json({ message: "Accès refusé, token manquant" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        console.log("Decoded token:", decoded); // Log activé pour déboguer
        const user = yield User_1.default.findByPk(decoded.id);
        if (!user) {
            console.log("Utilisateur non trouvé pour l'ID:", decoded.id);
            res.status(401).json({ message: "Utilisateur non trouvé" });
            return;
        }
        req.user = {
            id: user.id,
            uuid: user.uuid,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            createdBy: user.createdBy,
        };
        next();
    }
    catch (error) {
        let message = "Erreur inconnue";
        if (error instanceof Error) {
            message = error.message;
        }
        res.status(401).json({ message: "Token invalide", error: message });
    }
});
exports.AuthMiddleware = AuthMiddleware;
// Middleware pour vérifier si l'utilisateur est un administrateur
const AdminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        res
            .status(403)
            .json({ message: "Accès refusé. Vous devez être administrateur." });
        return;
    }
    next();
};
exports.AdminMiddleware = AdminMiddleware;
