const Mascota = require('../models/mascotaModel');
const Usuario = require('../models/usuarioModel');

const crearError = (status, message) => Object.assign(new Error(message), { status });

const crear = async ({ dueño_id, nombre, especie, raza, edad, historial_medico }) => {
  if (!dueño_id) {
    throw crearError(400, 'dueño_id es obligatorio');
  }

  const dueño = await Usuario.findById(dueño_id);
  if (!dueño || !dueño.activo || dueño.rol !== 'cliente') {
    throw crearError(404, 'El dueño indicado no existe, no está activo o no es un cliente');
  }

  return Mascota.create({ dueño_id, nombre, especie, raza, edad, historial_medico });
};

const obtenerTodas = async () => {
  return Mascota.find();
};

const obtenerPorId = async (id) => {
  const mascota = await Mascota.findById(id);
  if (!mascota) {
    throw crearError(404, 'Mascota no encontrada');
  }
  return mascota;
};

module.exports = { crear, obtenerTodas, obtenerPorId };
