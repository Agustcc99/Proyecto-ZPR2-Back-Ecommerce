
const Order = require("../models/Order");
const Product = require("../models/Product");

/////////// POST /api/orders///////////////////////////////
// Solo cliente autenticado
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id; // viene del token
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "El pedido debe incluir al menos un producto." });
    }

    let total = 0;
    const orderItems = [];
    const productsToUpdate = [];

    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({
          message:
            "Cada item debe tener productId y quantity mayor que 0.",
        });
      }

      const product = await Product.findById(productId);

      if (!product || !product.active) {
        return res
          .status(404)
          .json({ message: `Producto no encontrado: ${productId}` });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          message: `Stock insuficiente para el producto ${product.name}`,
        });
      }

      const subtotal = product.price * quantity;
      total += subtotal;

      orderItems.push({
        product: product._id,
        quantity,
        price: product.price, // precio al momento del pedido
      });

      productsToUpdate.push({
        product,
        newStock: product.stock - quantity,
      });
    }

    // Actualizar stock de todos los productos
    for (const p of productsToUpdate) {
      p.product.stock = p.newStock;
      await p.product.save();
    }

    // Crear pedido
    const newOrder = new Order({
      user: userId,
      items: orderItems,
      status: "pendiente",
      total,
    });

    const savedOrder = await newOrder.save();
    await savedOrder.populate("items.product", "name price");

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error al crear pedido:", error);
    res.status(500).json({ message: "Error al crear el pedido" });
  }
};

/////////// GET /api/orders/my///////////////////
// Pedidos del usuario logueado
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId })
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Error al obtener pedidos del usuario:", error);
    res
      .status(500)
      .json({ message: "Error al obtener tus pedidos" });
  }
};

/////////// GET /api/orders ////////////////
// Solo admin: ver todos los pedidos
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "email role")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Error al obtener todos los pedidos:", error);
    res
      .status(500)
      .json({ message: "Error al obtener todos los pedidos" });
  }
};

/////////// PATCH /api/orders/:id/status ////////////////
// Solo admin: cambiar estado
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pendiente", "enviado", "cancelado"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Estado inválido. Valores permitidos: pendiente, enviado, cancelado",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error);
    res.status(500).json({
      message: "Error al actualizar el estado del pedido",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
