const mongoose = require('mongoose');

const mascotaSchema = new mongoose.Schema(
  {
    dueño_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El dueño es obligatorio']
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true
    },
    especie: {
      type: String,
      required: [true, 'La especie es obligatoria'],
      trim: true
    },
    raza: {
      type: String,
      trim: true
    },
    edad: {
      type: Number,
      min: [0, 'La edad no puede ser negativa']
    },
    historial_medico: [
      {
        _id: false,
        fecha: { type: Date, default: Date.now },
        observacion: { type: String, required: [true, 'La observación es obligatoria'] }
      }
    ]
  },
  { versionKey: false }
);

mascotaSchema.index({ dueño_id: 1 });

module.exports = mongoose.model('Mascota', mascotaSchema);
