import express from "express";
import "dotenv/config";
import "express-async-errors";
import https from "https";
import fs from "fs";

// Dev Library
import morgan from "morgan";

// CORS
import rateLimiter from "express-rate-limit";
import helmet from "helmet";
import xss from "xss-clean";
import cors from "cors";

// Mongo
import { connectDB } from "./db/connect.js";

// Middleware
import * as indexMiddlewareJs from "./middleware/index.js";

// Router
import { webhooksRoutesOrder,webhooksRoutesProduct } from "./routes/index.js";
import sendMail from "./controllers/senderEmail.js";

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


app.use("/api/v1/webhooks/order", webhooksRoutesOrder);
app.use("/api/v1/webhooks/product", webhooksRoutesProduct, sendMail);

app.get('/', (req, res) => {
    res.status(200).json({ ready: "ok" });
});

app.use(indexMiddlewareJs.notFoundMiddleware);
app.use(indexMiddlewareJs.errorHandlerMiddleware);


async function startApp() {
    try {
        await connectDB(process.env.MONGO_URI);
        if (process.env.TYPE_BUILD === "DEV") {
            const options = {
                key: fs.readFileSync('/Users/macbookpro/myapp.local-key.pem'),
                cert: fs.readFileSync('/Users/macbookpro/myapp.local.pem'),
            }
            https.createServer(options, app).listen(PORT, function () {
                console.log(`Server is running on https://myapp.local:${PORT}`);
            });
        }
        else {
            app.listen(PORT, function () {
                console.log(`Server was started on ${PORT} Port`);
            });
        }
    } catch (error) {
        console.log(error);
    }
}

startApp();
