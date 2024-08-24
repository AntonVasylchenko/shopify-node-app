import nodemailer from "nodemailer"
import "dotenv/config";
import customError from "../errors/index.js";
import { StatusCodes } from "http-status-codes";

function generateShopifyStyledEmail(firstName, lastName, productImageUrl, productName, productDescription, shopUrl) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Product from Your Shop</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                background-color: #f6f6f6;
                margin: 0;
                padding: 0;
                color: #333333;
            }
            .email-container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 40px;
                border: 1px solid #e0e0e0;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 30px;
            }
            .header img {
                max-width: 150px;
            }
            .greeting {
                font-size: 18px;
                color: #333333;
                margin-bottom: 20px;
            }
            .product-card {
                text-align: center;
                border-top: 1px solid #e0e0e0;
                padding-top: 30px;
                margin-top: 30px;
            }
            .product-image {
                width: 100%;
                max-width: 540px;
                height: auto;
                margin-bottom: 20px;
                border-radius: 8px;
            }
            .product-name {
                font-size: 24px;
                font-weight: bold;
                color: #333333;
                margin-bottom: 10px;
            }
            .product-description {
                font-size: 16px;
                color: #666666;
                margin-bottom: 30px;
            }
            .shop-button {
                background-color: #007bff;
                color: #ffffff;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                display: inline-block;
            }
            .footer {
                text-align: center;
                font-size: 14px;
                color: #999999;
                padding-top: 30px;
                border-top: 1px solid #e0e0e0;
                margin-top: 30px;
            }
        </style>
    </head>
    <body>

        <div class="email-container">

            <div class="greeting">
                <p>Hi ${firstName} ${lastName},</p>
                <p>We're thrilled to introduce our latest product, just for you.</p>
            </div>

            <div class="product-card">
                <img class="product-image" src="${productImageUrl}" alt="${productName}">
                <div class="product-name">${productName}</div>
                <div class="product-description">${productDescription}</div>
                <a class="shop-button" href="${shopUrl}">Shop Now</a>
            </div>

            <div class="footer">
                <p>&copy; 2024 Your Shop. All rights reserved.</p>
                <p><a href="#">Unsubscribe</a> | <a href="#">Manage Preferences</a></p>
            </div>
        </div>

    </body>
    </html>
  `;
}

async function sendMail(req, res) {
  const { clients } = req;
  if (!clients) {
    throw new customError.BadRequestError("Customers not found");

  }
  const { customers, product } = clients;

  [...customers].forEach( customer => {

    const emailHtml = generateShopifyStyledEmail(
      customer.firstName,
      customer.lastName,
      product.featuredImage.url,
      product.title,
      'This is a a new product',
      product.onlineStorePreviewUrl
    );
  
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.GMAIL_PASSWORD
      }
    });
  
    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: customer.email,
      subject: 'New product',
      html: emailHtml
    };
  
    transport.sendMail(mailOptions, function (error, info) {
      if (!error) {
        throw new customError.BadRequestError("Email was not sender");
      }
      console.log("Email was sender for" + customer.email);
      
      res.status(StatusCodes.OK).json({ msg: "Email was sender" });
    })

  })
}

export default sendMail