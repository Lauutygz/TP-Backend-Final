const turnoService = require('../services/turnoService');

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

const crearTurno = async (req, res) => {
  try {
    const turno = await turnoService.crear(req.body);
    res.status(201).json(turno);
  } catch (error) {
    responderError(res, error);
  }
};

const obtenerTurnos = async (req, res) => {
  try {
    const turnos = await turnoService.obtenerTodos();
    res.status(200).json(turnos);
  } catch (error) {
    responderError(res, error);
  }
};

const obtenerTurnoPorId = async (req, res) => {
  try {
    const turno = await turnoService.obtenerPorId(req.params.id);
    res.status(200).json(turno);
  } catch (error) {
    responderError(res, error);
  }
};

const actualizarTurno = async (req, res) => {
  try {
    const turno = await turnoService.actualizar(req.params.id, req.body);
    res.status(200).json(turno);
  } catch (error) {
    responderError(res, error);
  }
};

const eliminarTurno = async (req, res) => {
  try {
    await turnoService.eliminar(req.params.id);
    res.status(200).json({ message: 'Turno eliminado correctamente' });
  } catch (error) {
    responderError(res, error);
  }
};

module.exports = { crearTurno, obtenerTurnos, obtenerTurnoPorId, actualizarTurno, eliminarTurno };
