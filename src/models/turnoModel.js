const mongoose = require('mongoose');

const turnoSchema = new mongoose.Schema(
  {
    mascota_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mascota',
      required: [true, 'La mascota es obligatoria']
    },
    cliente_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El cliente es obligatorio']
    },
    veterinario_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El veterinario es obligatorio']
    },
    servicio_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Servicio',
      required: [true, 'El servicio es obligatorio']
    },
    // Embebido: copia del servicio al momento de reservar (precio histórico)
    servicio_snapshot: {
      nombre: { type: String, required: true },
      precio: { type: Number, required: true },
      duracion_minutos: { type: Number, required: true }
    },
    fecha: {
      type: Date,
      required: [true, 'La fecha es obligatoria']
    },
    estado: {
      type: String,
      required: [true, 'El estado es obligatorio'],
      enum: {
        values: ['pendiente', 'confirmado', 'completado', 'cancelado'],
        message: 'El estado debe ser pendiente, confirmado, completado o cancelado'
      },
      default: 'pendiente'
    },
    notas: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    versionKey: false
  }
);

turnoSchema.index({ veterinario_id: 1, fecha: 1 });
turnoSchema.index({ cliente_id: 1, fecha: -1 });
turnoSchema.index({ servicio_id: 1 });

module.exports = mongoose.model('Turno', turnoSchema);
