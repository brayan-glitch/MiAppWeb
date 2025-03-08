const mongoose = require('mongoose');

const historialRecargaSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    cantidad: { type: Number, required: true },
    porcentaje: { type: Number, required: true },
    totalFinal: { type: Number, required: true },
    fecha: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const HistorialRecarga = mongoose.model('HistorialRecarga', historialRecargaSchema);
module.exports = HistorialRecarga;
