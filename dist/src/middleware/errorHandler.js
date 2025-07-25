"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Middleware de gestion des erreurs
const errorHandler = (err, req, res, next) => {
    console.error("❌ Erreur:", err);
    // Message d'erreur convivial pour le client
    const clientMessage = "Désolé, nous rencontrons actuellement quelques difficultés techniques. Notre équipe a été notifiée et travaille à résoudre le problème. Veuillez réessayer dans quelques instants.";
    res.status(500).json({
        success: false,
        message: clientMessage,
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
};
exports.default = errorHandler;
