const express = require("express");
const router = express.Router();
const usuarioController = require("../controladores/usuarioController");

router.post("/logIn", usuarioController.logIn);

router.post("/users", usuarioController.registrarUsuario);

module.exports = router;