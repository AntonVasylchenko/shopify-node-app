import { Router } from "express";
import { postOrderWebhooksShopify } from "../controllers/index.js";

const router = Router();

router.route("/").post(postOrderWebhooksShopify);

export default router;