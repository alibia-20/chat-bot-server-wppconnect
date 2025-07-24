import { NewProduct, ProductElement } from "../models";
import humanSleep from "../utils/humanSleep";

export async function sendProductByFacebookId(
  clientInstance: any,
  senderId: string,
  idPostFacebook: string
): Promise<boolean> {
  const product = await NewProduct.findOne({
    where: { idPostFacebook },
    include: [{ model: ProductElement, as: "elements" }],
  });

  if (!product) {
    console.log("⚠️ Aucun produit ne correspond à cet ID Facebook :", idPostFacebook);
    return false;
  }

  console.log(`📦 Produit trouvé via ID Facebook : ${product.name}`);

  const sortedElements = (product.elements || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  for (const element of sortedElements) {
    await humanSleep();

    if (element.type === "text" && element.content) {
      await clientInstance.sendText(senderId, element.content);
    }

    if (element.type === "image" && typeof element.imageUrl === "string" && element.imageUrl) {
      const fullImageUrl = element.imageUrl.startsWith("/")
        ? `${process.env.BASE_URL}${element.imageUrl}`
        : `${process.env.BASE_URL}/${element.imageUrl}`;

      await clientInstance.sendImage(senderId, fullImageUrl, "image.jpg", element.caption || "");
    }
  }

  return true;
}
