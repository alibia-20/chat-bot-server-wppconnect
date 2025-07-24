import * as wppconnect from "@wppconnect-team/wppconnect";
import { io } from "../index";
import Contact from "../models/Contact";
import humanSleep from "../utils/humanSleep";

import { handleIncomingMessage } from "../services/messageHandler";

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
      },
      statusFind: (statusSession: string) => {
        console.log("📶 Statut de la session:", statusSession);
        io.emit("status", statusSession);
      },
      headless: true,
      useChrome: true,
      browserArgs: ["--no-sandbox"],
      puppeteerOptions: { args: ["--no-sandbox"] },
    });

    isInitializing = false;
    console.log("✅ WPPConnect client prêt.");

    clientInstance.onStateChange((state: string) => {
      console.log("📱 État du client WhatsApp:", state);
      if (state === "DISCONNECTED") {
        console.log("🔁 Reconnexion en cours...");
        setTimeout(() => initializeWppClient().catch(console.error), 5000);
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
