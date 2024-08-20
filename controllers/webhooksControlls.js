import { StatusCodes } from "http-status-codes";
async function getWebhooksShopify(req,res) {
    console.log("123");
    console.log(req.body);
    
    res.status(StatusCodes.OK).json({ msg: "hello" });
}

const webhooksControlls = {
    getWebhooksShopify
}

export default webhooksControlls