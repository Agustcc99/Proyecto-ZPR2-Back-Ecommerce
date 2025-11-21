// tests/orders.test.js
const request = require("supertest");
const app = require("../src/app");
const Product = require("../src/models/Product");
const Order = require("../src/models/Order");

require("./setup");

// Helpers
async function crearAdminYObtenerToken() {
  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Admin",
      email: "admin@test.com",
      password: "123456",
      role: "admin",
    });

  const login = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@test.com", password: "123456" });

  return login.body.token;
}

async function crearClienteYObtenerToken() {
  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Cliente",
      email: "cliente@test.com",
      password: "123456",
    });

  const login = await request(app)
    .post("/api/auth/login")
    .send({ email: "cliente@test.com", password: "123456" });

  return login.body.token;
}

describe("Orders API", () => {

  test("Cliente puede crear un pedido y descuenta el stock", async () => {
    const tokenCliente = await crearClienteYObtenerToken();

    // Creamos un producto
    const prod = await Product.create({
      name: "Producto test",
      description: "desc",
      price: 100,
      stock: 5,
      active: true,
    });

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${tokenCliente}`)
      .send({
        items: [
          {
            productId: prod._id,
            quantity: 2,
          },
        ],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("status", "pendiente");
    expect(res.body).toHaveProperty("total", 200);
    expect(res.body.items[0]).toHaveProperty("quantity", 2);

    // Verificamos stock descontado
    const actualizado = await Product.findById(prod._id);
    expect(actualizado.stock).toBe(3);
  });

  test("NO permite crear pedido si stock es insuficiente", async () => {
    const tokenCliente = await crearClienteYObtenerToken();

    const prod = await Product.create({
      name: "Stock bajo",
      description: "desc",
      price: 50,
      stock: 1,
      active: true,
    });

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${tokenCliente}`)
      .send({
        items: [
          {
            productId: prod._id,
            quantity: 5,
          },
        ],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch("Stock insuficiente");
  });

  test("NO permite crear pedido si el producto no existe", async () => {
    const tokenCliente = await crearClienteYObtenerToken();

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${tokenCliente}`)
      .send({
        items: [
          {
            productId: "64dbf381f65a0a0000000000", // ID inexistente
            quantity: 1,
          },
        ],
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch("Producto no encontrado");
  });

  test("NO permite crear pedido con body inválido", async () => {
    const tokenCliente = await crearClienteYObtenerToken();

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${tokenCliente}`)
      .send({
        items: [],
      });

    expect(res.statusCode).toBe(400);
  });

  test("Cliente puede ver solo SUS pedidos", async () => {
    const tokenCliente = await crearClienteYObtenerToken();

    const prod = await Product.create({
      name: "P1",
      description: "desc",
      price: 80,
      stock: 10,
      active: true,
    });

    // Crear un pedido
    await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${tokenCliente}`)
      .send({
        items: [{ productId: prod._id, quantity: 1 }],
      });

    // Ver pedidos
    const res = await request(app)
      .get("/api/orders/my")
      .set("Authorization", `Bearer ${tokenCliente}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  test("Admin puede ver TODOS los pedidos", async () => {
    const tokenAdmin = await crearAdminYObtenerToken();

    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("Admin puede cambiar estado de un pedido", async () => {
    const tokenCliente = await crearClienteYObtenerToken();
    const tokenAdmin = await crearAdminYObtenerToken();

    const prod = await Product.create({
      name: "P Cambio",
      description: "desc",
      price: 120,
      stock: 10,
      active: true,
    });

    // Crear pedido
    const pedido = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${tokenCliente}`)
      .send({
        items: [{ productId: prod._id, quantity: 1 }],
      });

    const orderId = pedido.body._id;

    // Cambiar estado
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ status: "enviado" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("status", "enviado");
  });

  test("NO permite estado inválido", async () => {
    const tokenCliente = await crearClienteYObtenerToken();
    const tokenAdmin = await crearAdminYObtenerToken();

    const prod = await Product.create({
      name: "P Inv",
      description: "desc",
      price: 30,
      stock: 10,
      active: true,
    });

    // Crear pedido
    const pedido = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${tokenCliente}`)
      .send({
        items: [{ productId: prod._id, quantity: 1 }],
      });

    const res = await request(app)
      .patch(`/api/orders/${pedido.body._id}/status`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ status: "volado" });

    expect(res.statusCode).toBe(400);
  });

  test("NO permite cambiar estado de pedido inexistente", async () => {
    const tokenAdmin = await crearAdminYObtenerToken();

    const res = await request(app)
      .patch(`/api/orders/64dbf381f65a0a0000000000/status`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ status: "enviado" });

    expect(res.statusCode).toBe(404);
  });
});
