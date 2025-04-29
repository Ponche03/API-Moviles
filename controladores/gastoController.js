const Gasto = require("../modelos/gastoModel");

// Crear un gasto
exports.crearGasto = async (req, res) => {
  try {
    const nuevoGasto = new Gasto(req.body);
    const gastoGuardado = await nuevoGasto.save();
    res.status(201).json(gastoGuardado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear gasto", error });
  }
};

// Obtener todos los gastos
exports.obtenerGastos = async (req, res) => {
  try {
    const gastos = await Gasto.find().populate("Id_user");
    res.json(gastos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener gastos", error });
  }
};

// Obtener un gasto por ID
exports.obtenerGastoPorId = async (req, res) => {
  try {
    const gasto = await Gasto.findById(req.params.id).populate("Id_user");
    if (!gasto) return res.status(404).json({ mensaje: "Gasto no encontrado" });
    res.json(gasto);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener gasto", error });
  }
};

// Actualizar un gasto
exports.actualizarGasto = async (req, res) => {
  try {
    const gastoActualizado = await Gasto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!gastoActualizado)
      return res.status(404).json({ mensaje: "Gasto no encontrado" });
    res.json(gastoActualizado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar gasto", error });
  }
};

// Eliminar un gasto
exports.eliminarGasto = async (req, res) => {
  try {
    const gastoEliminado = await Gasto.findByIdAndDelete(req.params.id);
    if (!gastoEliminado)
      return res.status(404).json({ mensaje: "Gasto no encontrado" });
    res.json({ mensaje: "Gasto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar gasto", error });
  }
};
