import axios from "axios";
import resolveFacebookReel from "./resolveFacebookReel"; // Assure-toi que ce fichier existe

/**
 * Extrait un lien Facebook d'une chaîne de texte
 */
function extractLink(input: string): string | null {
  const regex = /(https?:\/\/[^\s]+)/;
  const match = input.match(regex);
  return match ? match[0] : null;
}

/**
 * Fonction principale : traite un lien Facebook court (fb.me) ou reel, et retourne l'ID formaté
 */
async function processFacebookLink(
  shortLink: string
): Promise<{ longLink: string; formattedId: string } | null> {
  const extractedLink = extractLink(shortLink);

  if (!extractedLink) {
    console.log("❌ Aucun lien détecté dans le message.");
    return null;
  }

  console.log("📎 Lien extrait :", extractedLink);

  try {
    // Étape 1 : suivre les redirections pour obtenir le lien long
    const response = await axios.head(extractedLink, {
      maxRedirects: 10,
      timeout: 8000, // ← utile pour certaines redirections lentes
    });
    let longLink = response.request.res.responseUrl;
    console.log("🔗 Lien long résolu :", longLink);

    // 🔁 Si c'est un lien reel, essaie de le résoudre
    if (longLink.includes("/reel/")) {
      const resolved = await resolveFacebookReel(longLink);
      if (resolved) {
        longLink = resolved;
        console.log("🔗 Lien reel transformé :", longLink);
      }
    }

    // Étape 2 : extraire les identifiants du lien long
    const regexPatterns = [
      /facebook\.com\/(\d+)\/videos\/[^\/]+\/(\d+)/, // ✅ slug + video ID
      /facebook\.com\/(\d+)\/posts\/(\d+)/,
      /facebook\.com\/(\d+)\/videos\/(\d+)/,
      /facebook\.com\/(\d+)\/photos\/(\d+)/,
      /story_fbid=(\d+)&id=(\d+)/,
      /facebook\.com\/permalink\.php\?story_fbid=(\d+)&id=(\d+)/,
    ];

    let pageId: string | null = null;
    let postId: string | null = null;

    for (const regex of regexPatterns) {
      const match = longLink.match(regex);
      if (match) {
        if (regex.source.includes("story_fbid")) {
          postId = match[1];
          pageId = match[2];
        } else {
          pageId = match[1];
          postId = match[2];
        }
        break;
      }
    }

    if (!pageId || !postId) {
      console.log("❌ Aucun identifiant Facebook trouvé dans le lien.");
      return null;
    }

    const formattedId = `${pageId}_${postId}`;
    console.log("✅ Identifiant formaté :", formattedId);

    return { longLink, formattedId };
  } catch (error: any) {
    console.error("🚨 Erreur lors du traitement du lien :", error.message);
    return null;
  }
}

export default processFacebookLink;
