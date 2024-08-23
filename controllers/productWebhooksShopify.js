import { StatusCodes } from "http-status-codes";
import { shopify, session } from "../api/shopify.js";
import { clientModel } from "../models/index.js";
import customError from "../errors/index.js";

const graphqlClient = new shopify.clients.Graphql({ session });

function createCustomerList(client) {
    return {
        email: client.email,
        firstName: client.first_name,
        lastName: client.last_name
    };
}

async function getInfoProduct(id) {
    const query = `query {
        product(id: "gid://shopify/Product/${id}") {
            title
            featuredImage {
                url
            }
            onlineStorePreviewUrl
        }
    }`

    const response = await graphqlClient.request(query);

    return response.data.product ? response.data.product : null

}

async function postProductWebhooksShopify(req, res) {
    const { id, tags } = req.body;
    const tagsToSearch = tags.trim().split(',').map(tag => new RegExp(tag, 'i'));

    const clients = await clientModel.find({
        tags: { $in: tagsToSearch }
    });

    const customerList = await Promise.all(clients.map(createCustomerList));
    const product = await getInfoProduct(id);

    res.status(StatusCodes.OK).json({ msg: "Product was created", customers: customerList, product: product });

}

export default postProductWebhooksShopify;
