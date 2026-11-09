const usuarioService = require('../services/usuarioService');

const responderError = (res, error) => {
  if (error.status) {
    return res.status(error.status).json({ message: error.message });
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: error.message });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'Ya existe un registro con ese valor único' });
  }
  console.error(error);
  return res.status(500).json({ message: 'Error interno del servidor' });
};

const registrar = async (req, res) => {
  try {
    const usuario = await usuarioService.registrar(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    responderError(res, error);
  }
};

const login = async (req, res) => {
  try {
    const resultado = await usuarioService.login(req.body);
    res.status(200).json(resultado);
  } catch (error) {
    responderError(res, error);
  }
};

module.exports = { registrar, login };
