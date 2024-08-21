import mongoose from "mongoose";
import validator from "validator";

const ClientSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            trim: true,
            unique: true,
            required: [true, "Please provide email customer"],
            validate: {
                validator: validator.isEmail,
                message: "Please provide valid email",
            },
        },
        tags: {
            type: String,
            trim: true,
            required: [true, "Please provide product tags"],
        },
        first_name: {
            type: String,
            trim: true,
        },
        last_name: {
            type: String,
            trim: true,
        }
    }
)

const Client = mongoose.model("Client", ClientSchema);

export default Client;