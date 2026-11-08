import mongoose, { Schema, InferSchemaType, model, models } from "mongoose";

// Shop products (SerenFinds) — posted in admin → Shop products, shown on /shop.
const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" }, // short description on the card
    price: { type: Number, required: true, min: 0 }, // kobo
    currency: { type: String, default: "NGN" },
    images: { type: [String], default: [] }, // Cloudinary URLs, first = cover
    inStock: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true, index: true },
    seeded: { type: Boolean, default: false },
  },
  { timestamps: true },
);

ProductSchema.index({ published: 1, order: 1 });

export type Product = InferSchemaType<typeof ProductSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ProductModel =
  models.Product || model("Product", ProductSchema);
