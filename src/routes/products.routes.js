const express = require('express');
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');

//middlewares
const {authenticationToken} = require('../middlewares/authMiddleware');
const {authorizeRoles} = require('../middlewares/roleMiddleware');
const { validateProductBody } = require("../middlewares/validateRequest");


const router = express.Router();

// /////////////////////////
// Rutas públicas (lectura)/
// /////////////////////////

// GET /api/products
router.get("/", getProducts);

// GET /api/products/:id
router.get("/:id", getProductById);

// /////////////////////////////
//Rutas protegidas (escritura)//
// /////////////////////////////

// POST /api/products
router.post(
    "/",
    authenticationToken,          // 1) verifica JWT
    authorizeRoles("admin"),    // 2) chequea rol
    validateProductBody,      // valida el body
    createProduct               // 3) ejecuta la lógica del controlador
  );

// PUT /api/products/:id
router.put(
    "/:id",
    authenticationToken,
    authorizeRoles("admin"),
    validateProductBody,
    updateProduct
  );
// DELETE /api/products/:id
router.delete(
    "/:id",
    authenticationToken,
    authorizeRoles("admin"),
    deleteProduct
  );


module.exports = router;