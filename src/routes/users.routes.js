const express = require("express");
const router = express.Router();

const { getMe, getUsers } = require("../controllers/userController");
const { authenticationToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// GET /api/users/me
// Cualquier usuario logueado puede ver su perfil
router.get("/me", authenticationToken, getMe);

// GET /api/users
// Solo admin puede ver la lista completa de usuarios
router.get("/", authenticationToken, authorizeRoles("admin"), getUsers);

module.exports = router;
