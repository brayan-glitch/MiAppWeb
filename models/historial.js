const mongoose = require('mongoose');

const historialSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    codigo: { type: String, required: true },
    duracion: { type: String, required: true },
    fechaCompra: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Historial', historialSchema);
