const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/authController');
const { validateRegisterBody } = require("../middlewares/validateRequest");


// Rutas de autenticación
//POST /api/auth/register
router.post('/register',validateRegisterBody, register);
//POST /api/auth/login
router.post('/login', login);

module.exports = router;