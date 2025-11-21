const jtw = require('jsonwebtoken');

const authenticationToken = (req, res, next) => {

    // Tomamos el header "Authorization" del request
    const authHeader = req.headers["authorization"];
    
    //Si NO hay header Authorization, significa que el cliente no mandó token
    if (!authHeader) {
        return res.status(401).json({ message: "Token no proporcionado" });
    }

    const [scheme, token] = authHeader.split(" ");

    //Verificamos que el esquema sea Bearer
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
