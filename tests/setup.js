// tests/setup.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("../src/config/database");

// Aumentamos el timeout global de Jest 
jest.setTimeout(30000);

// Cargar variables de entorno
dotenv.config();

// Forzar modo test (para que database.js use MONGO_URI_TEST)
process.env.NODE_ENV = "test";

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  // Si no hay DB aún, salimos sin romper
  if (!mongoose.connection.db) return;

  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});
