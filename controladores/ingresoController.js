const Ingreso = require("../modelos/ingresoModel");
const moment = require("moment-timezone");

// Crear ingreso
exports.crearIngreso = async (req, res) => {
  try {
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
      anio,
      mes,
      dia,
      tipo,
      montoMin,
      montoMax,
      limite = 10,
      pagina = 1,
      ordenFecha = "desc", // Nuevo parámetro con valor por defecto
    } = req.query;

    if (!usuarioID) {
      return res.status(400).json({ mensaje: "El usuarioID es requerido." });
    }

    let filtros = { Id_user: usuarioID };

    if (anio && mes && dia) {
      const fechaInicio = moment
        .tz(
          {
            year: anio,
            month: mes - 1,
            day: dia,
            hour: 0,
            minute: 0,
            second: 0,
          },
          "America/Mexico_City"
        )
        .toDate();
      const fechaFin = moment
        .tz(
          {
            year: anio,
            month: mes - 1,
            day: dia,
            hour: 23,
            minute: 59,
            second: 59,
            millisecond: 999,
          },
          "America/Mexico_City"
        )
        .toDate();
      filtros.Fecha = { $gte: fechaInicio, $lte: fechaFin };
    } else if (anio && mes) {
      const fechaInicio = moment
        .tz({ year: anio, month: mes - 1, day: 1 }, "America/Mexico_City")
        .startOf("day")
        .toDate();
      const fechaFin = moment
        .tz({ year: anio, month: mes - 1 }, "America/Mexico_City")
        .endOf("month")
        .toDate();
      filtros.Fecha = { $gte: fechaInicio, $lte: fechaFin };
    } else if (anio) {
      const fechaInicio = moment
        .tz({ year: anio, month: 0, day: 1 }, "America/Mexico_City")
        .startOf("day")
        .toDate();
      const fechaFin = moment
        .tz({ year: anio, month: 11, day: 31 }, "America/Mexico_City")
        .endOf("day")
        .toDate();
      filtros.Fecha = { $gte: fechaInicio, $lte: fechaFin };
    }

    if (tipo) filtros.Tipo = tipo;

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
    const orden = ordenFecha === "asc" ? 1 : -1;

    const total = await Ingreso.countDocuments(filtros);
    const totalPaginas = Math.ceil(total / limiteInt);

    const ingresos = await Ingreso.find(filtros)
      .populate("Id_user")
      .sort({ Fecha: orden }) // Ordenar por fecha
      .skip((paginaInt - 1) * limiteInt)
      .limit(limiteInt);

    const ingresosConZona = ingresos.map((ingreso) => {
      const ingresoObj = ingreso.toObject();
      ingresoObj.FechaLocal = moment(ingreso.Fecha)
        .tz("America/Mexico_City")
        .format();
      return ingresoObj;
    });

    const totalMonto = ingresosConZona.reduce(
      (acc, ingreso) => acc + ingreso.Monto,
      0
    );

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
