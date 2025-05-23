const express = require('express');
const router = express.Router();
const ingresoController = require('../controladores/ingresoController');
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/ingresos', authMiddleware, ingresoController.crearIngreso);

router.get('/ingresos', authMiddleware, ingresoController.obtenerIngresos);

router.get('/ingresos/:id',authMiddleware, ingresoController.obtenerIngresoPorId);

router.put('/ingresos/:id', authMiddleware, ingresoController.actualizarIngreso);

router.delete('/ingresos/:id', authMiddleware, ingresoController.eliminarIngreso);

module.exports = router;
