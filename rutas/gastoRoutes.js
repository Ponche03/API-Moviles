const express = require('express');
const router = express.Router();
const gastoController = require('../controladores/gastoController');
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/gastos', authMiddleware, gastoController.crearGasto);

router.get('/gastos', authMiddleware, gastoController.obtenerGastos);

router.get('/gastos/:id', authMiddleware, gastoController.obtenerGastoPorId);

router.put('/gastos/:id', authMiddleware, gastoController.actualizarGasto);

router.delete('/gastos/:id', authMiddleware, gastoController.eliminarGasto);

module.exports = router;
