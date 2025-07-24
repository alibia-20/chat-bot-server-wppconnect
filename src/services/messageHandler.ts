import { handleFaq } from "./faqHandler";
import handleProducts from "./productHandler";
import  {handleIncomingProductMessage}  from "../config/utils/handleIncomingProductMessage";

export const handleIncomingMessage = async (clientInstance: any, message: any) => {
    const FacebookMessages = message;
  const senderId = message.from;
  const rawText = message.body || "";

  
  const cleanText = rawText.replace(/[^\w\s]/gi, "").toLowerCase();

if (FacebookMessages.ctwaContext) {
  // 🔍 Vérification si le message contient un lien Facebook
  const ctwaContext = FacebookMessages.ctwaContext || {};
   await handleIncomingProductMessage(
           ctwaContext,
            senderId,
            clientInstance
          );
  // Si c'est un lien Facebook, on le traite
          console.log("📎 Lien Facebook traité.");
          return;
       
}
  // Traitement spécial liens Facebook
  if (rawText.includes("fb.me")) {
    console.log(rawText, "📎 Lien Facebook start traitement.");
    // TODO: traitement spécifique des liens Facebook
    return;
  }

  // Traitement groupe (exemple, à étendre)
  if (message.isGroupMsg) {
    console.log("📛 Message de groupe reçu, traitement spécifique à faire.");
    // TODO: traitement groupe
    return;
  }

  // Traitement FAQ
  const faqResult = await handleFaq(clientInstance, senderId, cleanText);
  if (faqResult) return; // réponse envoyée

  // Traitement Produits
  const productResult = await handleProducts(clientInstance, senderId, cleanText);
  if (productResult) return; // réponse envoyée

  console.log("❌ Aucun traitement applicable pour ce message.");
};
