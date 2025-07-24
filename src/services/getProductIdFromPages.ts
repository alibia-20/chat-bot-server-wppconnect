import axios from "axios";

async function getProductIdFromPages(
  productId: string
): Promise<{ id: string; pageName: string } | null> {
  // Liste des pages Facebook avec leur nom et token
  const pages = [
    {
      name: "Page 1",
      access_token:
        "EAAQZBjOj8ZBnsBOZBKGVVCwFkmn0gKe0msJpZC3x12ziyGy5dV9rAaQlInuUZBCbIP6xhZCCZAODRdZA68COfpVDH0kVie67oBNHZCt7JdFXKwxNpTvdq49gMgISK2CdjyIgnPqy77H7fQWNkmpVZBuj6Bkr0NdaJLkkmLiMFDla2bIj96BEZCUhxj31w3n6BQVstMP",
    },
    {
      name: "Page 2",
      access_token:
        "EAAQZBjOj8ZBnsBOwfRuDcIhE40VZB1wlp103GAQR8g9witj4pZBFxk6aRIFbZB01P6ZAelOnQL7EtHy5uwTKAGdaUTAj0nim23kl3E4ACZBZBF5m2SRiZBoOXnRyegDPzGsWfASIp8fZC4YVuSCaetMZAv2rHciaEepZBZCl7qu5oMRbXblc3YjHLZCpJ2Pkl9rjKqPdsZD",
    },
    {
      name: "Mme Tendance",
      access_token:
        "EAAQZBjOj8ZBnsBPLc78FHPcdL1b7LKZBYGttlL04hk7DT1wzaCTtO73cU1ZAZBJPZBnsFIZAkZCfZBKkgSE44ilFNnqGhK8ZAIp2p2ZBPHUVPtI7mmJL4KoD0pilIqZBYpPNE0FYkx7oZBnunUpsZBmNdQehYrnjWZAnVS951m3nFI1vviLTZBjQ2DHPTsnXE13FwYOJTvgSNr292af4",
    },
  ];

  const fetchProductId = async (
    productId: string,
    accessToken: string
  ): Promise<string | null> => {
    const url = `https://graph.facebook.com/v22.0/${productId}?fields=id&access_token=${accessToken}`;
    try {
      const response = await axios.get(url);
      return response.data?.id || null;
    } catch {
      return null;
    }
  };

  for (const page of pages) {
    const foundId = await fetchProductId(productId, page.access_token);
    if (foundId) {
      console.log(`✅ Produit trouvé via la page : ${page.name}`);
      return { id: foundId, pageName: page.name };
    } else {
      console.log(`❌ Produit introuvable via : ${page.name}`);
    }
  }

  return null;
}

export default getProductIdFromPages;
