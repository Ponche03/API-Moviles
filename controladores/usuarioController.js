const User = require("../modelos/usuarioModel");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.logIn = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Buscar al usuario por Correo Electrónico
      const user = await User.findOne({ CorreoElectronico: email });
      if (!user)
        return res.status(400).json({ error: "E-mail o contraseña inválidos" });
  
      // Comparar la contraseña ingresada con la contraseña almacenada
      const isMatch = await bcrypt.compare(password, user.Contraseña);
      if (!isMatch)
        return res.status(400).json({ error: "E-mail o contraseña inválidos" });
  
      // Generar el token JWT
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      // Enviar respuesta con token e información del usuario
      res.status(200).json({
        message: "Inicio de sesión exitoso.",
        token,
        user: {
          _id: user._id,
          nombre: user.NombreCompleto,
          email: user.CorreoElectronico,
          foto_perfil: user.Foto || null,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error interno del servidor." });
    }
};

exports.registrarUsuario = async (req, res) => {
    try {
      const { nombre, email, password, foto_perfil } = req.body;
  
      // Verificar si ya existe un usuario con el mismo correo
      const usuarioExistente = await User.findOne({ CorreoElectronico: email });
      if (usuarioExistente) {
        return res.status(400).json({ error: "Ya existe un usuario con ese correo electrónico." });
      }
  
      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Crear el nuevo usuario
      const nuevoUsuario = new User({
        NombreCompleto: nombre,
        CorreoElectronico: email,
        Contraseña: hashedPassword,
        Foto: foto_perfil || null,
      });
  
      await nuevoUsuario.save();
  
      // Respuesta
      res.status(200).json({
        message: "Usuario registrado correctamente",
        user: {
          _id: nuevoUsuario._id,
          nombre: nuevoUsuario.NombreCompleto,
          email: nuevoUsuario.CorreoElectronico,
          foto_perfil: nuevoUsuario.Foto,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error interno del servidor." });
    }
};
