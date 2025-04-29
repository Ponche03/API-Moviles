const Ingreso = require('../modelos/ingresoModel');

// Crear ingreso
exports.crearIngreso = async (req, res) => {
  try {
    const nuevoIngreso = new Ingreso(req.body);
    const ingresoGuardado = await nuevoIngreso.save();
    res.status(201).json(ingresoGuardado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear ingreso', error });
  }
};

// Obtener todos los ingresos
exports.obtenerIngresos = async (req, res) => {
  try {
    const ingresos = await Ingreso.find().populate('Id_user');
    res.json(ingresos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener ingresos', error });
  }
};

// Obtener ingreso por ID
exports.obtenerIngresoPorId = async (req, res) => {
  try {
    const ingreso = await Ingreso.findById(req.params.id).populate('Id_user');
    if (!ingreso) return res.status(404).json({ mensaje: 'Ingreso no encontrado' });
    res.json(ingreso);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener ingreso', error });
  }
};

// Actualizar ingreso
exports.actualizarIngreso = async (req, res) => {
  try {
    const ingresoActualizado = await Ingreso.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ingresoActualizado) return res.status(404).json({ mensaje: 'Ingreso no encontrado' });
    res.json(ingresoActualizado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar ingreso', error });
  }
};

// Eliminar ingreso
exports.eliminarIngreso = async (req, res) => {
  try {
    const ingresoEliminado = await Ingreso.findByIdAndDelete(req.params.id);
    if (!ingresoEliminado) return res.status(404).json({ mensaje: 'Ingreso no encontrado' });
    res.json({ mensaje: 'Ingreso eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar ingreso', error });
  }
};
