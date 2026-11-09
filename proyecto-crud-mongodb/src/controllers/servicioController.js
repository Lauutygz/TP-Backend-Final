const servicioService = require('../services/servicioService');

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

const crearServicio = async (req, res) => {
  try {
    const servicio = await servicioService.crear(req.body);
    res.status(201).json(servicio);
  } catch (error) {
    responderError(res, error);
  }
};

const obtenerServicios = async (req, res) => {
  try {
    const servicios = await servicioService.obtenerTodos();
    res.status(200).json(servicios);
  } catch (error) {
    responderError(res, error);
  }
};

const obtenerServicioPorId = async (req, res) => {
  try {
    const servicio = await servicioService.obtenerPorId(req.params.id);
    res.status(200).json(servicio);
  } catch (error) {
    responderError(res, error);
  }
};

const eliminarServicio = async (req, res) => {
  try {
    await servicioService.eliminar(req.params.id);
    res.status(200).json({ message: 'Servicio eliminado correctamente' });
  } catch (error) {
    responderError(res, error);
  }
};

module.exports = { crearServicio, obtenerServicios, obtenerServicioPorId, eliminarServicio };
