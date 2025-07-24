import * as wppconnect from "@wppconnect-team/wppconnect";
import { io } from "../index";
import Contact from "../models/Contact";
import humanSleep from "../utils/humanSleep";
import { handleIncomingMessage } from "../services/messageHandler";
import fs from "fs";
import path from "path";

let clientInstance: any;
let isInitializing = false;

export const initializeWppClient = async () => {
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

    const create = (wppconnect as any).create ?? (wppconnect as any).default?.create;

    clientInstance = await create({
      session: "default",
      catchQR: (base64Qr: string) => {
        const cleanBase64 = base64Qr.replace("data:image/png;base64,", "");
        io.emit("qrCode", cleanBase64);
        // Sauvegarder le QR code en image PNG pour affichage web
        const qrPath = path.join(__dirname, '../../public/images/qr.png');
        fs.writeFileSync(qrPath, cleanBase64, { encoding: 'base64' });
        // Définir un timer d'expiration de 24h
        setTimeout(() => {
          io.emit("qrCodeExpired");
          // Optionnel : supprimer le QR code expiré
          if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath);
          console.log("⏰ QR code expiré après 24h");
        }, 24 * 60 * 60 * 1000);
      },
      statusFind: (statusSession: string) => {
        console.log("📶 Statut de la session:", statusSession);
        io.emit("status", statusSession);
      },
      headless: true,
      useChrome: true,
      browserArgs: ["--no-sandbox"],
      puppeteerOptions: {
        args: ["--no-sandbox"],
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      },
    });

    isInitializing = false;
    console.log("✅ WPPConnect client prêt.");

    clientInstance.onStateChange((state: string) => {
      console.log("📱 État du client WhatsApp:", state);
      if (
        state === "DISCONNECTED" ||
        state === "qrReadError" ||
        state === "browserClose"
      ) {
        console.log("🔁 Reconnexion et régénération du QR code en cours...");
        setTimeout(() => initializeWppClient().catch(console.error), 1000);
      }
    });

    clientInstance.onMessage(async (message: any) => {
      const senderId = message.from;
      const phoneNumber = senderId.split("@")[0];
      const rawText = message.body || "";

      // Ignore messages de groupe ici
      if (message.isGroupMsg) {
        console.log("📛 Message de groupe ignoré dans le client principal");
        return;
      }

      console.log("📩 Message reçu de", phoneNumber, ":", rawText);
      await humanSleep();

      try {
        // Enregistrer nouveau contact si besoin
        const existingContact = await Contact.findOne({ where: { phone: phoneNumber } });
        if (!existingContact) {
          await Contact.create({
            phone: phoneNumber,
            name: message.sender?.pushname || "Inconnu",
            firstMessageAt: new Date(),
          });
          console.log("👤 Nouveau contact enregistré:", phoneNumber);
        //   await scheduleReminderMessage(clientInstance, phoneNumber);
        }

        // Déléguer le traitement du message
        await handleIncomingMessage(clientInstance, message);

      } catch (err) {
        console.error("❌ Erreur traitement du message :", err);
      }
    });

    return clientInstance;
  } catch (error) {
    console.error("❌ Erreur d'initialisation de WPPConnect :", error);
    isInitializing = false;
    throw error;
  }
};

// Ajout des fonctions utilitaires pour le contrôle du client WhatsApp
export async function getWppStatus() {
  if (!clientInstance) return 'non connecté';
  try {
    const state = await clientInstance.getState();
    return state;
  } catch (e) {
    return 'erreur';
  }
}

export async function logoutWppClient() {
  if (clientInstance) {
    await clientInstance.logout();
    clientInstance = null;
  }
  // Supprimer le QR code image s'il existe
  const qrPath = path.join(__dirname, '../../public/images/qr.png');
  if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath);
}

export async function regenQrWppClient() {
  if (clientInstance) {
    await clientInstance.logout();
    clientInstance = null;
  }
  // Supprimer le QR code image s'il existe
  const qrPath = path.join(__dirname, '../../public/images/qr.png');
  if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath);
  await initializeWppClient();
}
