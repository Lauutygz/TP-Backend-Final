const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarioModel');

const crearError = (status, message) => Object.assign(new Error(message), { status });

const registrar = async ({ nombre, email, password, rol, telefono }) => {
  const usuario = await Usuario.create({ nombre, email, password, rol, telefono });

  // La contraseña (hash) nunca se devuelve en la respuesta
  const resultado = usuario.toObject();
  delete resultado.password;
  return resultado;
};

const login = async ({ email, password }) => {
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw crearError(400, 'Email y password son obligatorios');
  }

  const usuario = await Usuario.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!usuario || !usuario.activo || !(await usuario.compararPassword(password))) {
    throw crearError(401, 'Credenciales inválidas');
  }

  const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });

  return {
    token,
    usuario: {
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    }
  };
};

module.exports = { registrar, login };
