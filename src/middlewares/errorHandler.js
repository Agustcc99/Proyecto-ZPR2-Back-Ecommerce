//Express busca el middleware de errores que tiene esta firma:
//(err, req, res, next)//////

const errorHandler = (err, req, res, next) => {
    console.error("Error capturado: ", err);
  
    // Si el error trae un .status y .message se manda
    if (err.status) {
      return res.status(err.status).json({
        status: "error",
        message: err.message || "Error inesperado",
      });
    }
  
    // Errores de validacion de Mongoose
    if (err.name === "ValidationError") {
      return res.status(400).json({
        status: "error",
        message: err.message,
      });
    }
  
    // Errores no controlados
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  };
  
  module.exports = errorHandler;
  