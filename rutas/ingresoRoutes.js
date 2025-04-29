const express = require('express');
const router = express.Router();
const ingresoController = require('../controladores/ingresoController');

router.post('/ingresos', ingresoController.crearIngreso);

router.get('/ingresos', ingresoController.obtenerIngresos);

router.get('/ingresos/:id', ingresoController.obtenerIngresoPorId);

router.put('/ingresos/:id', ingresoController.actualizarIngreso);

router.delete('/ingresos/:id', ingresoController.eliminarIngreso);

module.exports = router;
