const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true
    },
    descripcion: {
      type: String,
      trim: true
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo']
    },
    duracion_minutos: {
      type: Number,
      required: [true, 'La duración es obligatoria'],
      min: [1, 'La duración debe ser de al menos 1 minuto']
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      trim: true
    },
    activo: {
      type: Boolean,
      default: true
    }
  },
  { versionKey: false }
);

servicioSchema.index({ categoria: 1 });

module.exports = mongoose.model('Servicio', servicioSchema);
