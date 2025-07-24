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
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const initializeWppClient_1 = require("../config/initializeWppClient");
const router = express_1.default.Router();
router.get("/qr", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../../public/qr.html"));
});
router.post("/initialize", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, initializeWppClient_1.initializeWppClient)();
        res.json({ success: true, message: "Initialisation démarrée" });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Erreur lors de l'initialisation" });
    }
}));
router.post("/reset", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.json({ success: true, message: "Client réinitialisé" });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Erreur lors de la réinitialisation" });
    }
}));
exports.default = router;
