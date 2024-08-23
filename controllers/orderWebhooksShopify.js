import { StatusCodes } from "http-status-codes";
import { shopify, session } from "../api/shopify.js";
import { clientModel } from "../models/index.js";
import customError from "../errors/index.js";

const client = new shopify.clients.Graphql({ session });

function creatCustomerModel(customer, tags) {
    const customerModel = {};
    if (customer.email) {
        customerModel.email = customer.email;
    }
    if (tags.size != 0) {
        customerModel.tags = tags;
    }
    if (customer.first_name) {
        customerModel.first_name = customer.first_name;
    }
    if (customer.last_name) {
        customerModel.last_name = customer.last_name;
    }

    return customerModel
}
function updateCustomerTag(oldTags, newTags) {
    const oldArrayTags = oldTags.split(",");
    const newArrayTags = newTags.split(",");
    const allArrayTags = [...oldArrayTags, ...newArrayTags];
    const uniqueArrayTags = [...new Set(allArrayTags)];
    const uniqueArrayString = uniqueArrayTags.join(",");

    return uniqueArrayString
}

async function getStringTags(products) {
    const uniqueListId = [...new Set(products.map(product => product.product_id))];
    const fetchProductTags = async (id) => {
        const query = `query {
            product(id: "gid://shopify/Product/${id}") {
                tags
            }
        }`;

        const response = await client.request(query);

        if (response.data.product?.tags) return response.data.product.tags.join(",");

        return ""
    };

    const shopifyProductsTags = await Promise.all(uniqueListId.map(fetchProductTags));
    const productTagsString = shopifyProductsTags.join(",");
    return productTagsString
}

async function postOrderWebhooksShopify(req, res) {
    const { customer, line_items: products } = req.body;
    const currentCustomer = await clientModel.findOne({ email: customer.email });
    const productTagsString = await getStringTags(products);

    if (currentCustomer) {
        const { id, tags } = currentCustomer;
        const newTags = updateCustomerTag(tags, productTagsString);
        const updatedCustomer = await clientModel.findByIdAndUpdate({ _id: id }, { tags: newTags, first_name: customer.first_name, last_name: customer.last_name }, { new: true, runValidators: true });

        res.status(StatusCodes.OK).json({ model: updatedCustomer, msg: "Customer was updated" });
    } else {
        const customerModel = creatCustomerModel(customer, productTagsString)
        const clientDB = await clientModel.create(customerModel);

        if (!clientDB) {
            throw new customError.BadRequestError("Customer was not created");
        }

        console.log({ model: customerModel, msg: "Customer was created" });
        
        res.status(StatusCodes.CREATED).json({ model: customerModel, msg: "Customer was created" });
    }
}

export default postOrderWebhooksShopify