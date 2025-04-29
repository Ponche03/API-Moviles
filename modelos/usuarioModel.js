const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  CorreoElectronico: {
    type: String,
    required: true,
    unique: true
  },
  Contraseña: {
    type: String,
    required: true
  },
  NombreCompleto: {
    type: String,
    required: true
  },
  Foto: {
    type: String
  }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
