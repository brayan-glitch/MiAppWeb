const mongoose = require("mongoose");

const codigoSchema = new mongoose.Schema({
    valor: { type: String, unique: true, required: true }, // Corregido para coincidir con el router
    duracion: { type: String, required: true },
    fechaAgregado: { type: Date, default: Date.now },
    usuarioUsado: { type: String, default: null }, // Usuario que usó el código (si lo ha usado)
    fechaUso: { type: Date, default: null } // Fecha en que el código fue utilizado
});

module.exports = mongoose.model("Codigo", codigoSchema);
