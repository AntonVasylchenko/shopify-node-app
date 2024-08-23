import { Router } from "express";
import { postProductWebhooksShopify } from "../controllers/index.js";

const router = Router();

router.route("/").post(postProductWebhooksShopify);

export default router;