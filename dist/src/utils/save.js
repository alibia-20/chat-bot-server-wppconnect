"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Exemple de fonction pour sauvegarder une image base64 dans public
const saveBase64Image = (base64, filename) => {
    const base64Data = base64.replace(/^data:image\/png;base64,/, "");
    const filePath = path_1.default.join(__dirname, "public", filename);
    fs_1.default.writeFileSync(filePath, base64Data, "base64");
    return `/public/${filename}`; // URL relative pour l'accès
};
