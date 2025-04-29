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

// Obtener gastos por usuario con filtros y paginación
exports.obtenerGastos = async (req, res) => {
  try {
    const { usuarioID, fechaInicio, fechaFin, tipo, montoMin, montoMax, limite = 10, pagina = 1 } = req.query;

    if (!usuarioID) {
      return res.status(400).json({ mensaje: "El usuarioID es requerido." });
    }

    let filtros = {
      Id_user: usuarioID
    };

    // Filtro por rango de fecha
    if (fechaInicio && fechaFin) {
      filtros.Fecha = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin)
      };
    } else if (fechaInicio) {
      filtros.Fecha = { $gte: new Date(fechaInicio) };
    } else if (fechaFin) {
      filtros.Fecha = { $lte: new Date(fechaFin) };
    }

    // Filtro por tipo
    if (tipo) {
      filtros.Tipo = tipo;
    }

    // Filtro por rango de monto
    if (montoMin && montoMax) {
      filtros.Monto = {
        $gte: parseFloat(montoMin),
        $lte: parseFloat(montoMax)
      };
    } else if (montoMin) {
      filtros.Monto = { $gte: parseFloat(montoMin) };
    } else if (montoMax) {
      filtros.Monto = { $lte: parseFloat(montoMax) };
    }

    const limiteInt = parseInt(limite);
    const paginaInt = parseInt(pagina);

    const total = await Gasto.countDocuments(filtros);

    const totalPaginas = Math.ceil(total / limiteInt);

    const gastos = await Gasto.find(filtros)
      .populate("Id_user")
      .skip((paginaInt - 1) * limiteInt)
      .limit(limiteInt);

    res.json({
      total,
      totalPaginas,
      pagina: paginaInt,
      gastos
    });
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
    const gastoActualizado = await Gasto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!gastoActualizado) return res.status(404).json({ mensaje: "Gasto no encontrado" });
    res.json(gastoActualizado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar gasto", error });
  }
};

// Eliminar un gasto
exports.eliminarGasto = async (req, res) => {
  try {
    const gastoEliminado = await Gasto.findByIdAndDelete(req.params.id);
    if (!gastoEliminado) return res.status(404).json({ mensaje: "Gasto no encontrado" });
    res.json({ mensaje: "Gasto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar gasto", error });
  }
};
