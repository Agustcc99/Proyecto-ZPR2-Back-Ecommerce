// tests/auth.test.js
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");

// Carga setup conecta a la DB de test y limpia colecciones después de cada test
require("./setup");

describe("Auth API", () => {
  // limpiamos Users antes de empezar el primer test
  beforeAll(async () => {
    await User.deleteMany({});
  });

  test("Registro OK: crea un usuario correctamente", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Usuario Test",
        email: "user@test.com",
        password: "123456",
      });

    expect(res.statusCode).toBe(201);

    expect(res.body).toHaveProperty(
      "message",
      "Usuario registrado correctamente"
    );
    expect(res.body).toHaveProperty("user");

    const user = res.body.user;

    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("name", "Usuario Test");
    expect(user).toHaveProperty("email", "user@test.com");
    expect(user).toHaveProperty("role", "cliente");
  });

  test("Registro ERROR: debe fallar si faltan campos (validateRegisterBody)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "incompleto@test.com",
        // falta name y password
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  test("Registro ERROR: no permite email duplicado", async () => {
    // 1) Primero registramos un usuario con un email
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Usuario Original",
        email: "duplicado@test.com",
        password: "123456",
      });

    // 2) Intentamos registrar otro con el mismo email
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Otro Usuario",
        email: "duplicado@test.com",
        password: "abcdef",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "El email ya está en uso");
  });

  test("Login OK: devuelve token correctamente", async () => {
    // 1) Creamos el usuario que después vamos a loguear
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Login User",
        email: "login@test.com",
        password: "123456",
      });

    // 2) Intentamos login con esas credenciales
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@test.com",
        password: "123456",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Login exitoso");
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");
    expect(res.body.token.length).toBeGreaterThan(10);
  });

  test("Login ERROR: contraseña incorrecta devuelve 400", async () => {
    // 1) Creamos usuario válido
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Usuario Password",
        email: "password@test.com",
        password: "correcta",
      });

    // 2) Intentamos login con contraseña incorrecta
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "password@test.com",
        password: "incorrecta",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Credenciales inválidas");
  });

  test("Login ERROR: email inexistente devuelve 400", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "noexiste@test.com",
        password: "123456",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Credenciales inválidas");
  });
});
