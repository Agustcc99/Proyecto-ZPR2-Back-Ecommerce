const request = require("supertest");
const app = require("../src/app");
const Product = require("../src/models/Product");

require("./setup");

// Helpers para crear usuarios y obtener tokens
async function crearAdminYObtenerToken() {
  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Admin",
      email: "admin@test.com",
      password: "123456",
      role: "admin",
    });

  const resLogin = await request(app)
    .post("/api/auth/login")
    .send({
      email: "admin@test.com",
      password: "123456",
    });

  return resLogin.body.token;
}

async function crearClienteYObtenerToken() {
  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Cliente",
      email: "cliente@test.com",
      password: "123456",
      // sin role → por defecto "cliente"
    });

  const resLogin = await request(app)
    .post("/api/auth/login")
    .send({
      email: "cliente@test.com",
      password: "123456",
    });

  return resLogin.body.token;
}

describe("Products API", () => {
  test("GET /api/products debe devolver un array (solo productos activos)", async () => {
    // Creamos productos en la BD directamente
    await Product.create({
      name: "Producto Activo",
      description: "Desc",
      price: 100,
      stock: 10,
      active: true,
    });

    await Product.create({
      name: "Producto Inactivo",
      description: "Desc",
      price: 200,
      stock: 5,
      active: false,
    });

    const res = await request(app).get("/api/products");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // Solo debería venir el activo
    const nombres = res.body.map((p) => p.name);
    expect(nombres).toContain("Producto Activo");
    expect(nombres).not.toContain("Producto Inactivo");
  });

  test("POST /api/products permite crear producto a un admin", async () => {
    const adminToken = await crearAdminYObtenerToken();

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Producto Admin",
        description: "Creado por admin",
        price: 150,
        stock: 7,
        image: "https://example.com/img.png",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("name", "Producto Admin");
    expect(res.body).toHaveProperty("price", 150);
    expect(res.body).toHaveProperty("stock", 7);
  });

  test("POST /api/products NO permite crear producto a un cliente (403)", async () => {
    const clientToken = await crearClienteYObtenerToken();

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        name: "Producto Cliente",
        description: "No debería crearse",
        price: 10,
        stock: 1,
      });

    expect(res.statusCode).toBe(403);
  });

  test("DELETE /api/products/:id marca el producto como inactivo y luego no se puede obtener", async () => {
    const adminToken = await crearAdminYObtenerToken();

    // Creamos un producto
    const creado = await Product.create({
      name: "Producto a borrar",
      description: "Se va a desactivar",
      price: 300,
      stock: 3,
      active: true,
    });

    // Lo borramos vía API
    const resDelete = await request(app)
      .delete(`/api/products/${creado._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(resDelete.statusCode).toBe(200);
    expect(resDelete.body).toHaveProperty(
      "message",
      "Producto eliminado correctamente"
    );

    // Verificamos que ya no se pueda obtener por ID (404 porque active = false)
    const resGet = await request(app).get(`/api/products/${creado._id}`);

    expect(resGet.statusCode).toBe(404);
    expect(resGet.body).toHaveProperty("message", "Producto no encontrado");
  });
});
