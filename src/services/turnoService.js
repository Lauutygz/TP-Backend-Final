const Turno = require('../models/turnoModel');
const Mascota = require('../models/mascotaModel');
const Usuario = require('../models/usuarioModel');
const Servicio = require('../models/servicioModel');

const crearError = (status, message) => Object.assign(new Error(message), { status });

// Datos completos de las referencias (populate) para las operaciones de lectura
const POPULATE = [
  { path: 'servicio_id' },
  { path: 'mascota_id' },
  { path: 'cliente_id', select: 'nombre email telefono' },
  { path: 'veterinario_id', select: 'nombre email telefono' }
];

const crear = async ({ mascota_id, cliente_id, veterinario_id, servicio_id, fecha, notas }) => {
  if (!mascota_id || !cliente_id || !veterinario_id || !servicio_id) {
    throw crearError(400, 'mascota_id, cliente_id, veterinario_id y servicio_id son obligatorios');
  }

  const [mascota, cliente, veterinario, servicio] = await Promise.all([
    Mascota.findById(mascota_id),
    Usuario.findById(cliente_id),
    Usuario.findById(veterinario_id),
    Servicio.findById(servicio_id)
  ]);

  if (!mascota) throw crearError(404, 'La mascota indicada no existe');
  if (!cliente || !cliente.activo || cliente.rol !== 'cliente') {
    throw crearError(404, 'El cliente indicado no existe o no está activo');
  }
  if (!veterinario || !veterinario.activo || veterinario.rol !== 'veterinario') {
    throw crearError(404, 'El veterinario indicado no existe o no está activo');
  }
  if (!servicio || !servicio.activo) throw crearError(404, 'El servicio indicado no existe o no está activo');

  if (!mascota.dueño_id.equals(cliente._id)) {
    throw crearError(400, 'La mascota no pertenece al cliente indicado');
  }

  // Se copia el servicio al turno: si el precio cambia después, el turno conserva el original
  const servicio_snapshot = {
    nombre: servicio.nombre,
    precio: servicio.precio,
    duracion_minutos: servicio.duracion_minutos
  };

  return Turno.create({
    mascota_id,
    cliente_id,
    veterinario_id,
    servicio_id,
    servicio_snapshot,
    fecha,
    notas
  });
};

const obtenerTodos = async () => {
  return Turno.find().populate(POPULATE);
};

const obtenerPorId = async (id) => {
  const turno = await Turno.findById(id).populate(POPULATE);
  if (!turno) {
    throw crearError(404, 'Turno no encontrado');
  }
  return turno;
};

const actualizar = async (id, { fecha, estado, notas }) => {
  const cambios = {};
  for (const [campo, valor] of Object.entries({ fecha, estado, notas })) {
    if (valor === null) throw crearError(400, `El campo ${campo} no puede ser null`);
    if (valor !== undefined) cambios[campo] = valor;
  }

  if (Object.keys(cambios).length === 0) {
    throw crearError(400, 'Debe enviar al menos un campo modificable: fecha, estado o notas');
  }

  const turno = await Turno.findByIdAndUpdate(id, cambios, { new: true, runValidators: true });
  if (!turno) {
    throw crearError(404, 'Turno no encontrado');
  }
  return turno;
};

const eliminar = async (id) => {
  const turno = await Turno.findByIdAndDelete(id);
  if (!turno) {
    throw crearError(404, 'Turno no encontrado');
  }
  return turno;
};

module.exports = { crear, obtenerTodos, obtenerPorId, actualizar, eliminar };
