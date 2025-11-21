// Recibe una lista de roles permitidos
const authorizeRoles = (...rolesPermitidos) => {
    // Devolvemos un middleware que se ejecutará DESPUÉS de authenticationToken
    return (req, res, next) => {


        // Si llega aca sin req.user
        // significa que no se ejecuto authenticationToken antes
        if (!req.user) {
            return res.status(401).json({ message: "No autenticado" });
        }

        // Verificamos si el rol del usuario logueado (req.user.role)
        // está dentro de la lista de rolesPermitidos
        if (!rolesPermitidos.includes(req.user.role))
            //Si el rol no esta permitido
            return res.status(403).json({ message: "Acceso denegado: No tenes permisos" });
        //Si el rol es permitido, seguimos
        next();
    };
};
module.exports = { authorizeRoles };