const Servicio = require('../models/servicioModel');
const Turno = require('../models/turnoModel');

const crearError = (status, message) => Object.assign(new Error(message), { status });

const crear = async ({ nombre, descripcion, precio, duracion_minutos, categoria, activo }) => {
  return Servicio.create({ nombre, descripcion, precio, duracion_minutos, categoria, activo });
};

const obtenerTodos = async () => {
  return Servicio.find();
};

const obtenerPorId = async (id) => {
  const servicio = await Servicio.findById(id);
  if (!servicio) {
    throw crearError(404, 'Servicio no encontrado');
  }
  return servicio;
};

const eliminar = async (id) => {
  const enUso = await Turno.exists({ servicio_id: id });
  if (enUso) {
    throw crearError(409, 'No se puede eliminar: el servicio está referenciado por turnos existentes');
  }

  const servicio = await Servicio.findByIdAndDelete(id);
  if (!servicio) {
    throw crearError(404, 'Servicio no encontrado');
  }
  return servicio;
};

module.exports = { crear, obtenerTodos, obtenerPorId, eliminar };
