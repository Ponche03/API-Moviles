const Gasto = require("../modelos/gastoModel");
const moment = require("moment-timezone");

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

exports.obtenerGastos = async (req, res) => {
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
      ordenFecha = "desc",
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

    const total = await Gasto.countDocuments(filtros);
    const totalPaginas = Math.ceil(total / limiteInt);

    const gastos = await Gasto.find(filtros)
      .populate("Id_user")
      .sort({ Fecha: orden })
      .skip((paginaInt - 1) * limiteInt)
      .limit(limiteInt);

    const gastosConZona = gastos.map((gasto) => {
      const gastoObj = gasto.toObject();
      gastoObj.FechaLocal = moment(gasto.Fecha)
        .tz("America/Mexico_City")
        .format();
      return gastoObj;
    });

    const totalMonto = gastosConZona.reduce(
      (acc, gasto) => acc + gasto.Monto,
      0
    );

    res.json({
      total,
      totalPaginas,
      pagina: paginaInt,
      totalMonto,
      gastos: gastosConZona,
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

    const gastoObj = gasto.toObject();
    gastoObj.FechaLocal = moment(gasto.Fecha)
      .tz("America/Mexico_City")
      .format();

    res.json(gastoObj);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener gasto", error });
  }
};

// Actualizar un gasto
exports.actualizarGasto = async (req, res) => {
  try {
    if (req.body.Fecha) {
      req.body.Fecha = moment
        .tz(req.body.Fecha, "America/Mexico_City")
        .toDate();
    }

    const gastoActualizado = await Gasto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!gastoActualizado) return res.status(404).json({ mensaje: "Gasto no encontrado" });

    const gastoObj = gastoActualizado.toObject();
    gastoObj.FechaLocal = moment(gastoActualizado.Fecha)
      .tz("America/Mexico_City")
      .format();

    res.json(gastoObj);
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
