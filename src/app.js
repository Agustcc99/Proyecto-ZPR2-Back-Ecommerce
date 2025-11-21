const express = require("express");
const app = express();

const productsRouter = require("./routes/products.routes");
const authRouter = require("./routes/auth.routes");
const userRoutes = require("./routes/users.routes");
const ordersRouter = require("./routes/orders.routes");

const errorHandler = require("./middlewares/errorHandler");



//parsear JSON en el body
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "E-Commerce API funcionando" });
});
// test
app.get("/test", (req, res) => {
  res.json({ message: "Orders router OK" });
});

// Rutas de productos
app.use("/api/products", productsRouter);
// Rutas de autenticación
app.use("/api/auth", authRouter);
// Rutas de usuarios
app.use("/api/users", userRoutes);
// Rutas de orden
app.use("/api/orders", ordersRouter);


app.use(errorHandler);

module.exports = app;
