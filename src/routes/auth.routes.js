const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/authController');
const { validateRegisterBody } = require("../middlewares/validateRequest");


// Rutas de autenticación

//POST /api/auth/register
router.post('/register',validateRegisterBody, register); //Midlleware y controlador

//POST /api/auth/login
router.post('/login', login); //Midlleware y controlador

module.exports = router;