const validateRegisterBody = (req, res, next) => {
  const { email, password, name } = req.body;

  if (!email || typeof email !== "string") {
    return next({
      status: 400,
      message: "El email es obligatorio y debe ser texto",
    });
  }

  if (!email.includes("@")) {
    return next({
      status: 400,
      message: "El email no tiene un formato válido",
    });
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return next({
      status: 400,
      message:
        "El password es obligatorio y debe tener al menos 6 caracteres",
    });
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return next({
      status: 400,
      message: "El nombre es obligatorio",
    });
  }

  next();
};

const validateProductBody = (req, res, next) => {
  const { name, price, stock } = req.body;

  if (!name || typeof name !== "string") {
    return next({
      status: 400,
      message: "El nombre del producto es obligatorio",
    });
  }

  if (price == null || typeof price !== "number" || price < 0) {
    return next({
      status: 400,
      message:
        "El precio es obligatorio y debe ser un número positivo",
    });
  }

  if (stock == null || typeof stock !== "number" || stock < 0) {
    return next({
      status: 400,
      message:
        "El stock es obligatorio y debe ser un número positivo",
    });
  }

  next();
};

const validateOrderBody = (req, res, next) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next({
      status: 400,
      message: "El pedido debe incluir al menos un producto",
    });
  }

  for (const item of items) {
    if (!item.productId) {
      return next({
        status: 400,
        message: "Cada item debe tener productId",
      });
    }
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

  next();
};

module.exports = {
  validateRegisterBody,
  validateProductBody,
  validateOrderBody,
};
