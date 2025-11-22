const User = require("../models/User");

////////// GET /api/users/me //////////////
// Devuelve la info del usuario logueado usando req.user.id
const getMe = async (req, res) => {
  try {
    // Buscamos el usuario con el id que viene del token
    const user = await User.findById(req.user.id).select("-password"); 
    // .select("-password") excluye el campo password de la respuesta

    // Si no se encuentra el usuario 
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(user);

  } catch (error) {
    console.error("Error en getMe:", error);
    res.status(500).json({ message: "Error al obtener el perfil" });
  }
};

////////////// GET /api/users ///////////////
// Lista todos los usuarios, solo admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
    
  } catch (error) {
    console.error("Error en getUsers:", error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

module.exports = { getMe, getUsers };
