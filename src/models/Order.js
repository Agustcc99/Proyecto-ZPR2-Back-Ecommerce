const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false } // no hace falta _id por cada item
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "El pedido debe tener al menos un producto.",
      },
    },
    status: {
      type: String,
      enum: ["pendiente", "enviado", "cancelado"],
      default: "pendiente",
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
// Esquema Pedidos
/**
 * user: referencia al User que hizo el pedido
 * items: array de objetos:
 *      product, 
 *      quantity, 
 *      price
 * status: pendiente, enviado, cancelado
 * total: total del pedido
 */