const mongoose = require('mongoose');

const ingresoSchema = new mongoose.Schema({
  Id_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario', 
    required: true
  },
  Nombre: {
    type: String,
    required: true
  },
  Descripcion: String,
  Fecha: {
    type: Date,
    default: Date.now
  },
  Monto: {
    type: Number,
    required: true
  },
  Tipo: String,
  Archivo: String
});

module.exports = mongoose.model('Ingreso', ingresoSchema);
