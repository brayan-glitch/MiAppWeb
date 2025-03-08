const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true, trim: true },
    tipo: { type: String, enum: ['admin', 'no_admin'], required: true },
    saldo: { type: Number, default: 0 },
    telefono: { type: String, required: true, trim: true },  // 📞 Agregado
    localidad: { type: String, required: true, trim: true }  // 📍 Agregado
  },
  { timestamps: true }
);

const Usuario = mongoose.model('Usuario', usuarioSchema);
module.exports = Usuario;
