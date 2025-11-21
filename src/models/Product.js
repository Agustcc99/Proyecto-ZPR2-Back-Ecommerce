const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0, // no precios negativos
    },
    stock: {
      type: Number,
      required: true,
      min: 0, // no stock negativo
    },
    image: {
      type: String,
      default: "",
    },
    active: {
      type: Boolean,
      default: true, 
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;

//Esquema Productos