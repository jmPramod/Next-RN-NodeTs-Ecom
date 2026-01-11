import mongoose, { Schema, Document, Types } from "mongoose";
import Joi from "joi";
export interface Address {
  state: string;
  country: string;
  pinCode: number;
  landmark?: string;
}

export interface Auth extends Document {
  firstName: string;
  lastName?: string;
  phone: string;
  address: Address[];
  wishlist: Types.ObjectId[];
  email: string;
  password: string;
  isAdmin: "admin" | "user";
  profileImage: {
    imageUrl: string;
    imgPublicId: string | null;
  };
  imageUrl?:string;
  dob?: string;
  gender?: "male" | "female" | "others";
  clerkID?: string;
}

const authSchema = new Schema<Auth>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
imageUrl:{type:String},
    phone: {
      type: String,
      unique: true,
      required: true,
    },

     address: [
      {
        state: { type: String },
        country: { type: String, required: true },
        pinCode: { type: Number, required: true },
      },
    ],


    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],

    email: {
      type: String,
      unique: true,
      required: true,
    },

    password: { type: String, required: true },

    isAdmin: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    profileImage:  {
      imageUrl: { type: String, default: "https://res.cloudinary.com/dtvq8ysaj/image/upload/v1720770108/Global%20Images/profile_new-removebg-preview_motz7n.png" },
      imgPublicId: { type: String, default: null }
    },
    dob: { type: String },

    gender: {
      type: String,
      enum: ["male", "female", "others"],
    },

    clerkID: {
      type: String,
      unique: true,
      sparse: true, // allows multiple null values
    },
  },
  { timestamps: true }
);


export default mongoose.model<Auth>("users", authSchema);

const addressSchema = Joi.object({
  state: Joi.string().allow("", null),
  country: Joi.string().required().messages({
    "any.required": "Country is required",
    "string.empty": "Country cannot be empty",
  }),
  pinCode: Joi.number().required().messages({
    "any.required": "Pin code is required",
    "number.base": "Pin code must be a number",
  }),
});
export const RegisterSchemaValidation = Joi.object({
  firstName: Joi.string().required().messages({
    "any.required": "First name is required",
    "string.empty": "First name cannot be empty",
  }),

  lastName: Joi.string().allow("", null),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits",
      "any.required": "Phone number is required",
    }),

  address: Joi.array().items(addressSchema).min(1).required(),

  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Email must be valid",
  }),

  password: Joi.string().min(6).required().messages({
    "any.required": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),

  isAdmin: Joi.string().valid("admin", "user").default("user"),

  profileImage: Joi.string().allow("").default(""),

  dob: Joi.string().optional(),

  gender: Joi.string().valid("male", "female", "others").optional(),

  clerkID: Joi.string().optional(),
});
 