const Gasto = require('../modelos/gastoModel');      // Modelo del gasto
const Ingreso = require('../modelos/ingresoModel');  // Modelo del ingreso
const Usuario = require('../modelos/usuarioModel');  // Modelo del usuario

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.generarReportePorMes = async (req, res) => {
  try {
    const { correo, mes, año, tipoMovimiento } = req.body;

    // Validación básica
    if (!correo || !mes || !año || !tipoMovimiento) {
      return res.status(400).json({ error: 'Faltan datos requeridos (correo, mes, año, tipoMovimiento)' });
    }

    // Buscar usuario por correo
    const usuario = await Usuario.findOne({ Correo: correo });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Crear fechas de inicio y fin del mes del año especificado
    const fechaInicio = new Date(año, mes - 1, 1);         // Ej: 2025-03-01
    const fechaFin = new Date(año, mes, 0, 23, 59, 59);    // Ej: 2025-03-31 23:59:59

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
      mes,
      año,
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