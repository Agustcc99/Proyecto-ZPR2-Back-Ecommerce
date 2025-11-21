const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Si estamos en modo test, usa otra base
    const uri =
      process.env.NODE_ENV === "test"
        ? process.env.MONGO_URI_TEST || process.env.MONGO_URI 
        : process.env.MONGO_URI;

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB conectado: ${conn.connection.host} - DB: ${conn.connection.name}`);
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error.message);
    process.exit(1); // corta la app si falla la DB
  }
};

module.exports = connectDB;

