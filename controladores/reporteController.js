const Gasto = require('../modelos/gastoModel');      // Modelo del gasto
const Ingreso = require('../modelos/ingresoModel');  // Modelo del ingreso
const Usuario = require('../modelos/usuarioModel');  // Modelo del usuario

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.generarReportePorMes = async (req, res) => {
  try {
    const { usuarioID, mes, anio, tipoMovimiento } = req.query;

    // Validación básica
    if (!usuarioID || !mes || !anio || !tipoMovimiento) {
      return res.status(400).json({ error: 'Faltan datos requeridos (usuarioID, mes, anio, tipoMovimiento)' });
    }

    // Verificar si el usuario existe por ID
    const usuario = await Usuario.findById(usuarioID);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Convertir mes y anio a enteros (por si vienen como strings)
    const mesInt = parseInt(mes);
    const anioInt = parseInt(anio);

    // Crear fechas de inicio y fin del mes del año especificado
    const fechaInicio = new Date(anioInt, mesInt - 1, 1);
    const fechaFin = new Date(anioInt, mesInt, 0, 23, 59, 59);

    // Seleccionar el modelo adecuado
    const Modelo = tipoMovimiento === 'gasto' ? Gasto : Ingreso;

    // Agregación MongoDB
    const resultado = await Modelo.aggregate([
      {
        $match: {
          Id_user: usuario._id,
          Fecha: { $gte: fechaInicio, $lte: fechaFin }
        }
      },
      {
        $group: {
          _id: '$Tipo',
          totalPorTipo: { $sum: '$Monto' }
        }
      }
    ]);

    const totalGeneral = resultado.reduce((sum, item) => sum + item.totalPorTipo, 0);

    // Enviar respuesta
    res.json({
      usuario: usuario.Nombre_Usuario,
      mes: mesInt,
      anio: anioInt,
      tipoMovimiento,
      totalGeneral,
      totalPorTipo: resultado.map(r => ({
        tipo: r._id,
        total: r.totalPorTipo
      }))
    });

  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ error: 'Ocurrió un error al generar el reporte' });
  }
};

