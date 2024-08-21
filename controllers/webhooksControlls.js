import { StatusCodes } from "http-status-codes";
import { shopify, session } from "../api/shopify.js";
import { clientModel } from "../models/index.js";
import customError from "../errors/index.js";

const client = new shopify.clients.Graphql({ session });

async function getWebhooksShopify(req, res) {
    console.log("Hit");
    
    const customerModel = {};
    const { customer, line_items: products } = req.body
    const uniqueListId = [...new Set(products.map(product => product.product_id))];

    const fetchProductTags = async (id) => {
        const query = `query {
            product(id: "gid://shopify/Product/${id}") {
                tags
            }
        }`;
    
        const response = await client.query({
            data: {
                query: query,
                variables: {},
            },
            extraHeaders: { myHeader: '1' },
            tries: 1,
        });

        if (response.body.data.product?.tags) {
            return response.body.data.product.tags.join(",")
        }
        return ""
    };
    
    const shopifyProductsTags = await Promise.all(uniqueListId.map(fetchProductTags));
    const productTagsString = shopifyProductsTags.join(",");

    if (customer.email) {
        customerModel.email = customer.email;
    }
    if (productTagsString.size != 0) {
        customerModel.tags = productTagsString;
    }
    if (customer.first_name) {
        customerModel.first_name = customer.first_name;
    }
    if (customer.last_name) {
        customerModel.last_name = customer.last_name;
    }

    const clientDB = await clientModel.create(customerModel);
    
    if (!clientDB) {
        throw new customError.BadRequestError("Customer was not created");
    }
    
    res.status(StatusCodes.OK).json({ model: customerModel });
}

const webhooksControlls = {
    getWebhooksShopify
}

export default webhooksControlls