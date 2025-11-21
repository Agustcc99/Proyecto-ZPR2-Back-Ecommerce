const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const { authenticationToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const { validateOrderBody } = require("../middlewares/validateRequest");


// Cliente crea pedido
router.post("/", authenticationToken, authorizeRoles("cliente"), validateOrderBody,createOrder);

// Cliente ve sus pedidos
router.get("/my", authenticationToken, authorizeRoles("cliente"),  getMyOrders);

// Admin ve todos los pedidos
router.get("/", authenticationToken, authorizeRoles("admin"), getAllOrders);

// Admin cambia estado
router.patch(
  "/:id/status",
  authenticationToken,
  authorizeRoles("admin"),
  updateOrderStatus
);

module.exports = router;
