// tests/users.test.js
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");

require("./setup");

// Helpers para crear usuarios
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

describe("Users API", () => {
  test("GET /api/users/me devuelve el perfil del usuario", async () => {
    const token = await crearClienteYObtenerToken();

    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    // Debe devolver datos del usuario
    expect(res.body).toHaveProperty("email", "cliente@test.com");
    expect(res.body).toHaveProperty("name", "Cliente");

    // No debe traer password
    expect(res.body).not.toHaveProperty("password");
  });

  test("GET /api/users/me sin token devuelve 401", async () => {
    const res = await request(app).get("/api/users/me");

    expect(res.statusCode).toBe(401);
  });

  test("GET /api/users permite a admin listar todos los usuarios", async () => {
    const tokenAdmin = await crearAdminYObtenerToken();

    // Creamos además un cliente para que aparezca en la lista
    await crearClienteYObtenerToken();

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);

    // Debe devolver un array
    expect(Array.isArray(res.body)).toBe(true);

    // Debe haber al menos 2 usuarios (admin + cliente)
    expect(res.body.length).toBeGreaterThanOrEqual(2);

    // Ninguno debe tener "password"
    res.body.forEach((user) => {
      expect(user).not.toHaveProperty("password");
    });
  });

  test("GET /api/users NO permite a un cliente listar usuarios (403)", async () => {
    const tokenCliente = await crearClienteYObtenerToken();

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${tokenCliente}`);

    expect(res.statusCode).toBe(403);
  });

  test("GET /api/users sin token devuelve 401", async () => {
    const res = await request(app).get("/api/users");

    expect(res.statusCode).toBe(401);
  });
});
