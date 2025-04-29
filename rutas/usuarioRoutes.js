const express = require("express");
const router = express.Router();
const usuarioController = require("../controladores/usuarioController");
const authMiddleware = require("../middlewares/authMiddleware");

// Ruta para iniciar sesión
router.post("/logIn", usuarioController.logIn);

// Ruta para registrar un usuario
router.post("/users", usuarioController.registrarUsuario);

// Ruta para obtener detalles de un usuario
router.get("/users/:id", authMiddleware, usuarioController.obtenerUsuario);

// Ruta para editar un usuario
router.put("/users/:id", authMiddleware, usuarioController.editarUsuario);

// Ruta para eliminar un usuario
router.delete("/users/:id", authMiddleware, usuarioController.borrarUsuario);

// Ruta para obtener usuario por email 
router.get("/users", authMiddleware, usuarioController.obtenerUsuarioPorEmail);

module.exports = router;