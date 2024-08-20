import express from "express";
import "dotenv/config";
import "express-async-errors";
import https from "https";
import fs from "fs";
import fetch from 'node-fetch';

// Dev Library
import morgan from "morgan";

// CORS
import rateLimiter from "express-rate-limit";
import helmet from "helmet";
import xss from "xss-clean";
import cors from "cors";
// Shopify
import { shopify, session } from "./api/shopify.js";
// Mongo
import { connectDB } from "./db/connect.js";
// Middleware
import * as indexMiddlewareJs from "./middleware/index.js";
// Router
import { webhooksRoutes } from "./routes/index.js";

const client = new shopify.clients.Graphql({ session });


const options = process.env.TYPE_BUILD === "DEV" ?
    {
        key: fs.readFileSync('/Users/macbookpro/myapp.local-key.pem'),
        cert: fs.readFileSync('/Users/macbookpro/myapp.local.pem'),
    } :
    {};

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1);
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 120,
    })
);
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                'img-src': ["'self'", 'res.cloudinary.com', 'data:'],
            },
        },
    })
);
app.use(cors());
app.use(xss());

app.use(morgan("tiny"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.use("/api/v1/webhooks", webhooksRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ ready: "ok" });
});

// app.use(indexMiddlewareJs.notFoundMiddleware);
// app.use(indexMiddlewareJs.errorHandlerMiddleware);


async function startApp() {
    try {
        await connectDB(process.env.MONGO_URI);
        https.createServer(options, app).listen(PORT, function () {
            console.log(`Server is running on https://myapp.local:${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
}

startApp();