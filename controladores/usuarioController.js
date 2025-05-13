const User = require("../modelos/usuarioModel");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.logIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar al usuario por Correo
    const user = await User.findOne({ Correo: email });
    if (!user)
      return res.status(400).json({ error: "E-mail o contraseña inválidos" });

    // Comparar la contraseña ingresada con la almacenada
    const isMatch = await bcrypt.compare(password, user.Contraseña);
    if (!isMatch)
      return res.status(400).json({ error: "E-mail o contraseña inválidos" });

    // Generar token JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Respuesta con token e info del usuario
    res.status(200).json({
      message: "Inicio de sesión exitoso.",
      token,
      user: {
        _id: user._id,
        nombre: user.Nombre_Completo,
        usuario: user.Nombre_Usuario,
        email: user.Correo,
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
    const { nombre, usuario, email, password, foto_perfil } = req.body;

    // Verificar si ya existe un usuario con el mismo correo
    const usuarioExistente = await User.findOne({ Correo: email });
    if (usuarioExistente) {
      return res.status(400).json({ error: "Ya existe un usuario con ese correo electrónico." });
    }

    // Verificar si ya existe un usuario con el mismo nombre de usuario
    const usuarioExistenteNombre = await User.findOne({ Nombre_Usuario: usuario });
    if (usuarioExistenteNombre) {
      return res.status(400).json({ error: "Ya existe un usuario con ese nombre de usuario." });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    const nuevoUsuario = new User({
      Nombre_Completo: nombre,
      Nombre_Usuario: usuario,
      Correo: email,
      Contraseña: hashedPassword,
      Foto: foto_perfil || null,
    });

    await nuevoUsuario.save();

    // Respuesta
    res.status(200).json({
      message: "Usuario registrado correctamente",
      user: {
        _id: nuevoUsuario._id,
        nombre: nuevoUsuario.Nombre_Completo,
        usuario: nuevoUsuario.Nombre_Usuario,
        email: nuevoUsuario.Correo,
        foto_perfil: nuevoUsuario.Foto,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};


exports.obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await User.findById(id).select("-Contraseña");

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

exports.editarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { Nombre_Usuario, Nombre_Completo, Foto, password } = req.body;

    const usuario = await User.findById(id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    usuario.Nombre_Usuario = Nombre_Usuario || usuario.Nombre_Usuario;
    usuario.Nombre_Completo = Nombre_Completo || usuario.Nombre_Completo;
    if (Foto) {
      usuario.Foto = Foto;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      usuario.Contraseña = hashedPassword;
    }

    await usuario.save();
    res.status(200).json({ message: "Usuario actualizado correctamente.", usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

exports.borrarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await User.findByIdAndDelete(id);

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.status(200).json({ message: "Usuario eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

exports.obtenerUsuarioPorEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: "El parámetro 'email' es requerido." });
    }

    const usuario = await User.findOne({ Correo: email }).select("-Contraseña");

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
};
