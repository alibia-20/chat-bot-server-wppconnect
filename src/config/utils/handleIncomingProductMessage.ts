import type { Whatsapp } from "@wppconnect-team/wppconnect";
import processFacebookLink from "../../services/processFacebookLink";
import { NewProduct, ProductElement } from "../../models";
import getProductIdFromPages from "../../services/getProductIdFromPages";
import { Op } from "sequelize";
const baseImageUrl = "https://ec5546b610ae.ngrok-free.app"; // ✅ Remplace par ton vrai domaine

// Fonction pour délai aléatoire entre 1.5s et 4s
const humanSleep = async () => {
  const delay = Math.floor(Math.random() * 2500) + 1500;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export const handleIncomingProductMessage = async (
  message: string,
  senderPhone: string,
  client: Whatsapp
) => {
  try {
    console.log("📨 Message reçu :", message);

    // 🔗 Étape 1 : Extraire l'identifiant depuis le lien Facebook
    const result = await processFacebookLink(message);
    if (!result) {
      console.log("❌ Aucun ID Facebook trouvé.");
      return;
    }

    console.log("🔗 Lien long :", result.longLink);
    console.log("🆔 ID formaté :", result.formattedId);

    // 📦 Étape 2 : Vérifier si le produit existe sur Facebook
    const productId = await getProductIdFromPages(result.formattedId);
    if (!productId) {
      console.log("🚫 Produit introuvable sur Facebook.");
      await client.sendText(
        senderPhone,
        "Le produit associé à ce lien est introuvable sur nos pages."
      );
      return;
    }

    console.log("✅ ID du produit trouvé :", productId);

    // 🗄️ Étape 3 : Chercher le produit dans la base de données
    const product = await NewProduct.findOne({
      where: {
        [Op.or]: [{ keyword: productId }, { name: productId }],
      },
      include: [{ model: ProductElement, as: "elements" }],
    });

    if (!product) {
      console.log("🚫 Produit introuvable dans la base de données.");
   
      return;
    }

    console.log("🎯 Produit trouvé :", product.name);

    // 📤 Étape 4 : Envoi progressif des éléments
    const elements = (product.elements || []).sort((a, b) => a.order - b.order);

    for (const element of elements) {
      await humanSleep();

      if (element.type === "image" && element.imageUrl) {
        const imageLink = `${baseImageUrl}${element.imageUrl}`;
        console.log("📷 Envoi d'une image :", imageLink);
        await client.sendImage(
          senderPhone,
          imageLink,
          "produit.jpg",
          element.caption || ""
        );
      } else if (element.type === "text" && element.content) {
        console.log("📝 Envoi d'un texte :", element.content);
        await client.sendText(senderPhone, element.content);
      }
    }

    // ⏳ Dernier délai avant le message final
    await humanSleep();
    console.log("✅ Tous les éléments envoyés.");
    await client.sendText(senderPhone, "Souhaitez-vous passer commande ?");
  } catch (error: any) {
    console.error("❌ Erreur dans handleIncomingProductMessage :", error);
  }
};
