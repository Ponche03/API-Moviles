const express = require('express');
const router = express.Router();
const reporteController = require('../controladores/reporteController');

router.get('/reportes/reportePorMes', reporteController.generarReportePorMes);

module.exports = router;
