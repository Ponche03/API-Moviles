const express = require('express');
const router = express.Router();
const gastoController = require('../controladores/gastoController');
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/gastos', gastoController.crearGasto);

router.get('/gastos', gastoController.obtenerGastos);

router.get('/gastos/:id', gastoController.obtenerGastoPorId);

router.put('/gastos/:id', gastoController.actualizarGasto);

router.delete('/gastos/:id', gastoController.eliminarGasto);

module.exports = router;
