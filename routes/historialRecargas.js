const express = require("express");
const router = express.Router();
const HistorialRecarga = require("../models/historialRecargas");
const Usuario = require("../models/usuario");

// 📌 Obtener historial de recargas con opción de búsqueda y filtrado
router.get("/", async (req, res) => {
  try {
    const { usuarioId, mes } = req.query;
    let filtro = {};

    if (usuarioId) {
      filtro.usuario = usuarioId;
    }

    if (mes) {
      const fechaInicio = new Date(mes + "-01"); // Primer día del mes seleccionado
      const fechaFin = new Date(mes + "-31"); // Último día del mes
      filtro.fecha = { $gte: fechaInicio, $lte: fechaFin };
    }

    // 📌 Obtener el historial con los filtros aplicados
    const historial = await HistorialRecarga.find(filtro)
      .populate("usuario", "nombre")
      .sort({ fecha: -1 });

    // 📌 Calcular totales
    const totalCantidad = historial.reduce((sum, recarga) => sum + recarga.cantidad, 0);
    const totalFinal = historial.reduce((sum, recarga) => sum + recarga.totalFinal, 0);

    // 📌 Obtener la lista de usuarios para el formulario de búsqueda
    const usuarios = await Usuario.find({}, "nombre");

    res.render("historial_recargas", {
      historial,
      usuarios,
      usuarioId,
      mes,
      totalCantidad,
      totalFinal,
    });
  } catch (error) {
    console.error("❌ Error al obtener historial de recargas:", error);
    res.status(500).send("Error al obtener historial");
  }
});

module.exports = router;
