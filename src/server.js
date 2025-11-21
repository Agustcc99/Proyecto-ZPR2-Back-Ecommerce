require("dotenv").config(); // carga variables de .env

const app = require("./app");
const connectDB = require("./config/database");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Levantar servidor HTTP
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error.message);
    process.exit(1);
  }
};

startServer();
