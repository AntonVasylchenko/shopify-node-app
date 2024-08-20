import { Router } from "express";
import { webhooksControlls } from "../controllers/index.js";

const router = Router();

router.route("/").get(webhooksControlls.getWebhooksShopify);

export default router;