import express from "express";
import path from "path";
import {
  initializeWppClient,
  getWppStatus,
  logoutWppClient,
  regenQrWppClient,
} from "../config/initializeWppClient";

const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/qr.html"));
});

router.post("/initialize", async (req, res) => {
  try {
    await initializeWppClient();
    res.json({ success: true, message: "Initialisation démarrée" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erreur lors de l'initialisation" });
  }
});

router.post("/reset", async (req, res) => {
  try {
  
    res.json({ success: true, message: "Client réinitialisé" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erreur lors de la réinitialisation" });
  }
});

// Nouvelle route : état de connexion
router.get("/wpp-status", async (req, res) => {
  try {
    const status = await getWppStatus(); // à implémenter dans initializeWppClient
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur lors de la récupération du statut" });
  }
});

// Nouvelle route : déconnexion
router.post("/logout", async (req, res) => {
  try {
    await logoutWppClient(); // à implémenter dans initializeWppClient
    res.json({ success: true, message: "Déconnecté" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur lors de la déconnexion" });
  }
});

// Nouvelle route : régénérer QR code
router.post("/regen-qr", async (req, res) => {
  try {
    await regenQrWppClient(); // à implémenter dans initializeWppClient
    res.json({ success: true, message: "QR code régénéré" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur lors de la régénération du QR code" });
  }
});

export default router;
