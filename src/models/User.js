const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true, // no se puede repetir
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "cliente"],
      default: "cliente",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;

//Esquema Usuarios
