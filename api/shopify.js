import '@shopify/shopify-api/adapters/node';
import { shopifyApi, ApiVersion } from "@shopify/shopify-api";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-07";

export const shopify = shopifyApi({
    apiKey: process.env.API_KEY,
    apiSecretKey: process.env.API_SECRET_KEY,
    apiVersion: ApiVersion.July24,
    isCustomStoreApp: true,
    adminApiAccessToken: process.env.TOKEN,
    isEmbeddedApp: false,
    hostName: process.env.HOST,
    restResources,
    future: {
        lineItemBilling: true,
        customerAddressDefaultFix: true,
        unstable_managedPricingSupport: true,
    },
});

export const session = shopify.session.customAppSession(process.env.URL);
