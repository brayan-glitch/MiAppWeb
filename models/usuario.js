const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true, trim: true },
    tipo: { type: String, enum: ['admin', 'no_admin'], required: true },
    saldo: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Usuario = mongoose.model('Usuario', usuarioSchema);
module.exports = Usuario;
