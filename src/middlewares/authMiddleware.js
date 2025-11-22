const jtw = require('jsonwebtoken');

//asegurar que cada solicitud a una ruta protegida venga de un usuario autenticado
const authenticationToken = (req, res, next) => {

    // Captura del Header Authorization
    const authHeader = req.headers["authorization"];
    
    //¿Existe el Header?
    if (!authHeader) {
        return res.status(401).json({ message: "Token no proporcionado" });
    }

    //separacion del bearer y token
    const [scheme, token] = authHeader.split(" ");

    //¿Formato Correcto?
    if (scheme !== "Bearer") {
        return res.status(401).json({ message: "Formato de token NO valido" });
    }

    // Verificamos el token usando verify
    // Si el token es válido, decoded tendrá el payload que firmaste en el login: { id, role, email, ... }
    try {
        const decoded = jtw.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.userId,
            role: decoded.role,
            email: decoded.email,
        }; // Guardamos el payload en req.user para usarlo

        next(); // Pasamos al siguiente middleware o ruta

    } catch (error) {
        // Si verify lanza error, el token es inválido o está vencido
        console.error("Error al verificar el token: ", error);
        return res.status(401).json({ message: "Token invalido o expirado" });
    }
};

//Exportamos middleware
module.exports = {authenticationToken};

/*
*Ver si el cliente mandó un token.

*Verificar si el token es válido.

*Pegar el usuario en req.user.

*Si algo falla corta la cadena con un res.status(401).
 */
/*

*/
