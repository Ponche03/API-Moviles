const express = require('express');
const router = express.Router();
const gastoController = require('../controladores/gastoController');

router.post('/', gastoController.crearGasto);

router.get('/', gastoController.obtenerGastos);

router.get('/:id', gastoController.obtenerGastoPorId);

router.put('/:id', gastoController.actualizarGasto);

router.delete('/:id', gastoController.eliminarGasto);

module.exports = router;
