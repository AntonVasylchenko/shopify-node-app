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

const options = {
    key: fs.readFileSync('/Users/macbookpro/myapp.local-key.pem'),
    cert: fs.readFileSync('/Users/macbookpro/myapp.local.pem'),
};

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

app.get('/', (req, res) => {
    res.status(200).json({ msg: "True" });
});

async function startApp() {
    try {
        https.createServer(options, app).listen(PORT, function () {
            console.log(`Server is running on https://myapp.local:${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
}

startApp();
