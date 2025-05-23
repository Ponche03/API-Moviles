const express = require('express');
const router = express.Router();
const reporteController = require('../controladores/reporteController');
const authMiddleware = require("../middlewares/authMiddleware");

router.get('/reportes/reportePorMes', reporteController.generarReportePorMes);

module.exports = router;
