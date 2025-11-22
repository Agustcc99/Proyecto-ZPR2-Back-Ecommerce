const Product = require("../models/Product");

///// Obtener todos los productos/////////////////
// GET /api/products /////////
const getProducts = async (req, res) => {
  try {
    // solo productos activos
    const products = await Product.find({ active: true });
    res.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: "Error al obtener productos" });
  }
};

////////// Obtener un producto por ID///////////
// GET /api/products/:id////////
const getProductById = async (req, res) => {
  try {
    const { id } = req.params; //Trae id del producto

    const prod = await Product.findById(id);

    if (!prod || !prod.active) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(prod);

  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ message: "Error al obtener producto" });
  }
};

//////////// Crear un nuevo producto /////////////
// POST /api/products ////////Protegida
const createProduct = async (req, res) => {
  try {
    let { name, description, price, stock, image } = req.body;

    // validacion basica nombre, precio y stock
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    // Convertir a número por si vienen como string
    price = Number(price);
    stock = Number(stock);

    //validacion precio
    if (Number.isNaN(price) || price < 0) {
      return res.status(400).json({
        message: "El precio es obligatorio y debe ser un número mayor o igual a 0",
      });
    }

    //validacion stock
    if (Number.isNaN(stock) || stock < 0) {
      return res.status(400).json({
        message: "El stock es obligatorio y debe ser un número mayor o igual a 0",
      });
    }

    // Crear el producto
    const newProduct = await Product.create({
      name,
      description,
      price,
      stock,
      image,
    });

    res.status(201).json(newProduct);

  } catch (error) {
    console.error("Error al crear producto:", error);
    res
      .status(500)
      .json({ message: "Error al crear producto", error: error.message });
  }
};

/////////// Actualizar un producto////////////
// PUT /api/products/:id ////////Protegida
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params; //id de la url
    const { name, description, price, stock, image, active } = req.body;

    const prod = await Product.findById(id); //buscar producto por id

    // Si no existe
    if (!prod) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Actualizar campos si vienen en el body, lo otro no lo toca
    if (name !== undefined) prod.name = name;
    if (description !== undefined) prod.description = description;
    if (price !== undefined) prod.price = price;
    if (stock !== undefined) prod.stock = stock;
    if (image !== undefined) prod.image = image;
    if (active !== undefined) prod.active = active;

    await prod.save();
    res.json(prod);

  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ message: "Error al actualizar producto" });
  }
};

///////// Eliminar un producto /////////////
// DELETE /api/products/:id //////Protegida
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const prod = await Product.findById(id);

    // Si no existe o ya esta inactivo
    if (!prod?.active) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    //No lo elimina, sino que queda en active(false)
    prod.active = false;
    await prod.save();

    res.json({ message: "Producto eliminado correctamente" });

  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ message: "Error al eliminar producto" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
