const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  Correo: {
    type: String,
    required: true,
    unique: true
  },
  Contraseña: {
    type: String,
    required: true
  },
  Nombre_Usuario: {
    type: String,
    unique: true
  },
  Nombre_Completo: {
    type: String,
    required: true
  },
  Foto: {
    type: String
  }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
