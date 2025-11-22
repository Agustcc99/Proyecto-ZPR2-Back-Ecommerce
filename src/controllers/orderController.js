
const Order = require("../models/Order");
const Product = require("../models/Product");

/////////// POST /api/orders///////////////////////////////
// Solo cliente autenticado
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id; // viene del token
    const { items } = req.body;   

    // Validar items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "El pedido debe incluir al menos un producto." });
    }
    
    let total = 0;
    const orderItems = [];
    const productsToUpdate = [];

    //Iteroo sobre cada producto en el pedido
    for (const item of items) {
      const { productId, quantity } = item;

      // Validar cada item
      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({
          message:
            "Cada item debe tener productId y quantity mayor que 0.",
        });
      }

      // Buscar producto en BD
      const product = await Product.findById(productId);

      // Validar active
      if (!product || !product.active) {
        return res
          .status(404)
          .json({ message: `Producto no encontrado: ${productId}` });
      }
      // Validar stock
      if (product.stock < quantity) {
        return res.status(400).json({
          message: `Stock insuficiente para el producto ${product.name}`,
        });
      }

      // Calcular subtotal y acumular total
      const subtotal = product.price * quantity;
      total += subtotal;

      // Preparar item para el pedido
      orderItems.push({
        product: product._id,
        quantity,
        price: product.price, // precio al momento del pedido
      });

      // Preparar actualización de stock
      productsToUpdate.push({
        product,
        newStock: product.stock - quantity,
      });
    }

    // Actualiza stock de todos los productos
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
    const userId = req.user.id; // viene del token

    // Buscar pedidos del usuario
    const orders = await Order.find({ user: userId })
      .populate("items.product", "name price") // Mostramos name y price del producto
      .sort({ createdAt: -1 }); //Lo ordenamos

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
      .populate("user", "email role")//Incluye email y role del usuario
      .populate("items.product", "name price") // Incluye name y price del producto
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
    const { id } = req.params; // ID del pedido
    const { status } = req.body; // Nuevo estado

    const allowedStatuses = ["pendiente", "enviado", "cancelado"];
    // Validar estado
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Estado inválido. Valores permitidos: pendiente, enviado, cancelado",
      });
    }

    // Buscar odern por ID
    const order = await Order.findById(id);

    // Validar si existe la orden
    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // Actualizar estado
    order.status = status;
    // Guardar cambios
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
