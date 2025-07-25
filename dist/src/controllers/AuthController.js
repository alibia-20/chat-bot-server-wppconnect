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
exports.Login = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Charger les variables d'environnement dès le début
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User")); // Assure-toi que ce modèle est bien défini
const SECRET_KEY = process.env.JWT_SECRET || "Kx8Zm4VqT9NcY7PwJ2Bd5H6G3RLMAQX";
const SALT_ROUNDS = 10; // Niveau de hashage
// ➤ Fonction d'inscription d'un utilisateur
const Login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ where: { email } });
        if (!user) {
            res.status(400).json({ message: "Identifiants incorrects" });
            return; // Ajoutez un return ici
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: "Identifiants incorrects" });
            return; // Ajoutez un return ici
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, SECRET_KEY, {
            expiresIn: "7d",
        });
        res.json({ message: "Connexion réussie", token });
        return; // Ajoutez un return ici pour expliciter que la fonction se termine ici
    }
    catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
        return; // Ajoutez un return ici
    }
});
exports.Login = Login;
