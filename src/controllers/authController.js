const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

////////////////////// Registro de usuario/////////////////////////////////////////
//// POST /api/auth/register /////////

const register = async (req, res) => {
    try{
        const { name, email, password, role } = req.body; //destructuring
        //Validaciones basicas
        if(!name || !email || !password){
            return res.status(400).json({ message: 'Faltan datos obligatorios' });
        }
        //Verificar si el mail ya existe
        const existingUser = await User.findOne({ email });

        // Si encontramos un usuario, no dejamos registrar otro con el mismo email
        if (existingUser) {
            return res.status(400).json({ message: "El email ya está en uso" });
        }

        //Hashear la contraseña
        const salt = await bcrypt.genSalt(10); //cadena aleatoria 
        const hashedPassword = await bcrypt.hash(password, salt);

        //Crear el usuario
        const user = await User.create({ //crea un nuevo documento en la colección User
            name,
            email,
            password: hashedPassword,
            role: role || "cliente", //valor por defecto
        });

        //Devolver usuario sin la contraseña
        const userSafe = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
        res.status(201).json({
            message: "Usuario registrado correctamente",
            user: userSafe,
        });
    } catch (error) {
        console.error("Error en el registro de usuario:", error);
        res.status(500).json({ message: "Error en el Registro" });
    }  
};
//////////////////////////////////////////////
//              Login de usuario            //
/////////////////////////////////////////////
/////POST /api/auth/login ///////

const login = async (req, res) => {
    try{
        // Tomamos email y password del body de la petición
        const { email, password } = req.body;

        //Validaciones basicas
        if(!email || !password){
            return res.status(400).json({ message: "Faltan datos obligatorios" });
        }
        //Buscar usuario por email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }
        //Comparar contraseñas
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }

        //Datos a guardar en el token (payload)
        const payload = {
            userId: user._id,
            role: user.role,
            email: user.email,
        };
        //Crear token JWT
        //payload: info del usuario
        //process.env.JWT_SECRET: clave secreta en el .env
        //expiresIn: duración del token
        const token = jwt.sign(payload, process.env.JWT_SECRET,{  //Se firma con la clave secreta
            expiresIn: '1h' //Expira en una hora
        });

        res.json({
            message: "Login exitoso",
            token,
        });
    } catch (error) {
        console.error("Error en el login de usuario:", error);
        res.status(500).json({ message: "Error Al iniciar sesion" });
    }
};

module.exports = {
    register,
    login,
};
