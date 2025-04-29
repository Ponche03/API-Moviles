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

// Obtener ingresos por usuario con filtros y paginación
exports.obtenerIngresos = async (req, res) => {
  try {
    const { usuarioID, fechaInicio, fechaFin, tipo, montoMin, montoMax, limite = 10, pagina = 1 } = req.query;

    if (!usuarioID) {
      return res.status(400).json({ mensaje: 'El usuarioID es requerido.' });
    }

    // Construimos un objeto de filtros
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

    // Contar total de ingresos que cumplen con los filtros
    const total = await Ingreso.countDocuments(filtros);

    // Calcular total de páginas
    const totalPaginas = Math.ceil(total / limiteInt);

    // Obtener ingresos paginados
    const ingresos = await Ingreso.find(filtros)
      .populate('Id_user')
      .skip((paginaInt - 1) * limiteInt)
      .limit(limiteInt);

    res.json({
      total,
      totalPaginas,
      pagina: paginaInt,
      ingresos
    });

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
