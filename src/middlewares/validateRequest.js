// Middleware para validacion de datos para que las peticiones
//cumplan los requisitos minimos

//VALIDACIONES REGISTRO USUARIO
const validateRegisterBody = (req, res, next) => {
  // Extraemos email, password y name del body
  const { email, password, name } = req.body;

  // Validacion del email
  if (!email || typeof email !== "string") {
    return next({
      status: 400,
      message: "El email es obligatorio y debe ser texto",
    });
  }

  // Validacion que el email tenga formato válido
  if (!email.includes("@")) {
    return next({
      status: 400,
      message: "El email no tiene un formato válido",
    });
  }

  // Validación del password obligatorio, string y 6 caracteres
  if (!password || typeof password !== "string" || password.length < 6) {
    return next({
      status: 400,
      message:
        "El password es obligatorio y debe tener al menos 6 caracteres",
    });
  }

  // Validación del nombre obligatorio y no puede estar vacio
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return next({
      status: 400,
      message: "El nombre es obligatorio",
    });
  }

  // Si todas las validaciones pasan
  next();
};

//VALIDACION de
//Creación y Actualización de Producto
const validateProductBody = (req, res, next) => {
  // Extraemos datos del body
  const { name, price, stock } = req.body;

  // El nombre del producto es obligatorio y debe ser string
  if (!name || typeof name !== "string") {
    return next({
      status: 400,
      message: "El nombre del producto es obligatorio",
    });
  }

  // Validación del precio obligatorio, mayor o igual a 0
  if (price == null || typeof price !== "number" || price < 0) {
    return next({
      status: 400,
      message:
        "El precio es obligatorio y debe ser un número positivo",
    });
  }

  // Validación del stock obligatorio, mayor o igual a 0
  if (stock == null || typeof stock !== "number" || stock < 0) {
    return next({
      status: 400,
      message:
        "El stock es obligatorio y debe ser un número positivo",
    });
  }

  //OK
  next();
};

// VALIDACION de Creacion de Orden
const validateOrderBody = (req, res, next) => {
  // El pedido debe incluir un array de items
  const { items } = req.body;

  // items debe existir, debe ser array y tener al menos un elemento
  if (!items || !Array.isArray(items) || items.length === 0) {
    return next({
      status: 400,
      message: "El pedido debe incluir al menos un producto",
    });
  }

  // Recorremos cada item del pedido
  for (const item of items) {
    // Cada item debe tener un productId
    if (!item.productId) {
      return next({
        status: 400,
        message: "Cada item debe tener productId",
      });
    }
    // quantity obligatorio, mayor que 0
    if (
      item.quantity == null ||
      typeof item.quantity !== "number" ||
      item.quantity <= 0
    ) {
      return next({
        status: 400,
        message:
          "Cada item debe tener quantity numérico mayor que 0",
      });
    }
  }

  // Si es correcto
  next();
};

// Exportamos 
module.exports = {
  validateRegisterBody,
  validateProductBody,
  validateOrderBody,
};
