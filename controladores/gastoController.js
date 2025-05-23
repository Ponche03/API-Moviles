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

    const filtros = { Id_user: usuarioID };

    if (anio) {
      const inicio = moment.tz("America/Mexico_City").year(anio).startOf("year");
      const fin = moment.tz("America/Mexico_City").year(anio).endOf("year");

      if (mes) {
        inicio.month(mes - 1).startOf("month");
        fin.month(mes - 1).endOf("month");

        if (dia) {
          inicio.date(dia).startOf("day");
          fin.date(dia).endOf("day");
        }
      }

      filtros.Fecha = { $gte: inicio.toDate(), $lte: fin.toDate() };
    }

    if (tipo) filtros.Tipo = tipo;

    if (montoMin || montoMax) {
      filtros.Monto = {};
      if (montoMin) filtros.Monto.$gte = parseFloat(montoMin);
      if (montoMax) filtros.Monto.$lte = parseFloat(montoMax);
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
