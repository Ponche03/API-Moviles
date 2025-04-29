const express = require('express');
const router = express.Router();
const ingresoController = require('../controladores/ingresoController');

router.post('/', ingresoController.crearIngreso);

router.get('/', ingresoController.obtenerIngresos);

router.get('/:id', ingresoController.obtenerIngresoPorId);

router.put('/:id', ingresoController.actualizarIngreso);

router.delete('/:id', ingresoController.eliminarIngreso);

module.exports = router;
