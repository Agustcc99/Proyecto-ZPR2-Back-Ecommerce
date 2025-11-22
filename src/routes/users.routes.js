const express = require("express");
const router = express.Router();

//Controladores
const { getMe, getUsers } = require("../controllers/userController");
//Midllewares
const { authenticationToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// GET /api/users/me
// Cualquier usuario logueado puede ver su perfil
router.get("/me", authenticationToken, getMe); //Verifica si esta logueado y controlador

// GET /api/users
// Solo admin puede ver la lista completa de usuarios
router.get("/", authenticationToken, authorizeRoles("admin"), getUsers);//Verifica si esta logueado, role y controlador

module.exports = router;
