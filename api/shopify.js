import '@shopify/shopify-api/adapters/node';
import { shopifyApi, ApiVersion } from "@shopify/shopify-api";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";

export const shopify = shopifyApi({
    apiSecretKey: process.env.API_SECRET_KEY,
    apiVersion: ApiVersion.July24,
    isCustomStoreApp: true,
    adminApiAccessToken: process.env.TOKEN,
    isEmbeddedApp: false,
    hostName: process.env.HOST,
    restResources,
});

export const session = shopify.session.customAppSession(process.env.URL);
