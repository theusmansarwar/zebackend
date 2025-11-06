const mongoose = require("mongoose");

const ProductsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    detail: { type: String, required: true },
    image: { type: String, required: true },
    file: { type: String, required: true },
    published: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductsSchema);
module.exports = Product;
