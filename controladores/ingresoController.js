const Ingreso = require("../modelos/ingresoModel");
const moment = require("moment-timezone");

// Crear ingreso
exports.crearIngreso = async (req, res) => {
  try {
    // Ajustar la fecha a la zona horaria local antes de guardar
    if (req.body.Fecha) {
      req.body.Fecha = moment
        .tz(req.body.Fecha, "America/Mexico_City")
        .toDate();
    } else {
      req.body.Fecha = moment.tz("America/Mexico_City").toDate();
    }

    const nuevoIngreso = new Ingreso(req.body);
    const ingresoGuardado = await nuevoIngreso.save();
    res.status(201).json(ingresoGuardado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear ingreso", error });
  }
};

exports.obtenerIngresos = async (req, res) => {
  try {
    const {
      usuarioID,
      mes,   // mes numérico (1-12)
      anio,  // año numérico (e.g., 2025)
      tipo,
      montoMin,
      montoMax,
      limite = 10,
      pagina = 1,
    } = req.query;

    if (!usuarioID) {
      return res.status(400).json({ mensaje: "El usuarioID es requerido." });
    }

    let filtros = {
      Id_user: usuarioID,
    };

    if (mes && anio) {
      const fechaInicio = new Date(anio, mes - 1, 1);
      const fechaFin = new Date(anio, mes, 0, 23, 59, 59, 999);

      filtros.Fecha = {
        $gte: fechaInicio,
        $lte: fechaFin,
      };
    } else if (anio) {
      const fechaInicio = new Date(anio, 0, 1);
      const fechaFin = new Date(anio, 11, 31, 23, 59, 59, 999);

      filtros.Fecha = {
        $gte: fechaInicio,
        $lte: fechaFin,
      };
    }

    if (tipo) {
      filtros.Tipo = tipo;
    }

    if (montoMin && montoMax) {
      filtros.Monto = {
        $gte: parseFloat(montoMin),
        $lte: parseFloat(montoMax),
      };
    } else if (montoMin) {
      filtros.Monto = { $gte: parseFloat(montoMin) };
    } else if (montoMax) {
      filtros.Monto = { $lte: parseFloat(montoMax) };
    }

    const limiteInt = parseInt(limite);
    const paginaInt = parseInt(pagina);

    const total = await Ingreso.countDocuments(filtros);
    const totalPaginas = Math.ceil(total / limiteInt);

    const ingresos = await Ingreso.find(filtros)
      .populate("Id_user")
      .skip((paginaInt - 1) * limiteInt)
      .limit(limiteInt);

    const ingresosConZona = ingresos.map((ingreso) => {
      const ingresoObj = ingreso.toObject();
      ingresoObj.FechaLocal = moment(ingreso.Fecha)
        .tz("America/Mexico_City")
        .format();
      return ingresoObj;
    });

    // Sumar monto después de map (solo ingresos paginados)
    const totalMonto = ingresosConZona.reduce((acc, ingreso) => acc + ingreso.Monto, 0);

    res.json({
      total,
      totalPaginas,
      pagina: paginaInt,
      totalMonto,
      ingresos: ingresosConZona,
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener ingresos", error });
  }
};

// Obtener ingreso por ID
exports.obtenerIngresoPorId = async (req, res) => {
  try {
    const ingreso = await Ingreso.findById(req.params.id).populate("Id_user");
    if (!ingreso)
      return res.status(404).json({ mensaje: "Ingreso no encontrado" });

    const ingresoObj = ingreso.toObject();
    ingresoObj.FechaLocal = moment(ingreso.Fecha)
      .tz("America/Mexico_City")
      .format();

    res.json(ingresoObj);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener ingreso", error });
  }
};

// Actualizar ingreso
exports.actualizarIngreso = async (req, res) => {
  try {
    if (req.body.Fecha) {
      req.body.Fecha = moment
        .tz(req.body.Fecha, "America/Mexico_City")
        .toDate();
    }

    const ingresoActualizado = await Ingreso.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!ingresoActualizado)
      return res.status(404).json({ mensaje: "Ingreso no encontrado" });

    const ingresoObj = ingresoActualizado.toObject();
    ingresoObj.FechaLocal = moment(ingresoActualizado.Fecha)
      .tz("America/Mexico_City")
      .format();

    res.json(ingresoObj);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar ingreso", error });
  }
};

// Eliminar ingreso
exports.eliminarIngreso = async (req, res) => {
  try {
    const ingresoEliminado = await Ingreso.findByIdAndDelete(req.params.id);
    if (!ingresoEliminado)
      return res.status(404).json({ mensaje: "Ingreso no encontrado" });
    res.json({ mensaje: "Ingreso eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar ingreso", error });
  }
};
