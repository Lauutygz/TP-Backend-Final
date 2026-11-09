const mascotaService = require('../services/mascotaService');

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

const crearMascota = async (req, res) => {
  try {
    const mascota = await mascotaService.crear(req.body);
    res.status(201).json(mascota);
  } catch (error) {
    responderError(res, error);
  }
};

const obtenerMascotas = async (req, res) => {
  try {
    const mascotas = await mascotaService.obtenerTodas();
    res.status(200).json(mascotas);
  } catch (error) {
    responderError(res, error);
  }
};

const obtenerMascotaPorId = async (req, res) => {
  try {
    const mascota = await mascotaService.obtenerPorId(req.params.id);
    res.status(200).json(mascota);
  } catch (error) {
    responderError(res, error);
  }
};

module.exports = { crearMascota, obtenerMascotas, obtenerMascotaPorId };
