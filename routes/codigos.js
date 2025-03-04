const express = require("express");
const router = express.Router();
const Codigo = require("../models/codigo"); // Importar el modelo

// 📌 Ruta para ver códigos con filtro opcional por duración
router.get("/", async (req, res) => {
  try {
    const filtroDuracion = req.query.duracion; // 📌 Capturamos la duración si se envió en la URL
    let query = {};

    if (filtroDuracion) {
      query.duracion = filtroDuracion; // Filtrar solo si se seleccionó una duración
    }

    const codigos = await Codigo.find(query).populate("usuarioUso"); // Cargar usuario si se usó el código
    res.render("gestion_codigos", { codigos, filtroDuracion });
  } catch (error) {
    console.error("Error obteniendo códigos:", error);
    res.status(500).send("Error interno del servidor.");
  }
});
// 📌 Ruta para mostrar la página de gestión de códigos
router.get("/", async (req, res) => {
  try {
    const codigos = await Codigo.find();
    res.render("gestion_codigos", { codigos });
  } catch (error) {
    console.error("Error al obtener los códigos:", error);
    res.status(500).send("Error interno del servidor");
  }
});


// 📌 Ruta para agregar códigos desde la web
// 📌 Ruta para agregar nuevos códigos
router.post("/agregar", async (req, res) => {
  try {
      const { codigosTexto, duracion } = req.body;

      if (!codigosTexto || !duracion) {
          req.flash("mensaje", "⚠️ Debes ingresar códigos y seleccionar una duración.");
          return res.redirect("/codigos");
      }

      // 🔹 Separar los códigos por líneas, eliminar espacios y filtrar vacíos
      const codigosArray = codigosTexto.split("\n").map(c => c.trim()).filter(c => c);

      // 🔹 Filtrar códigos válidos (solo letras y números permitidos)
      const codigosValidos = codigosArray.filter(c => /^[a-zA-Z0-9]+$/.test(c));

      if (codigosValidos.length === 0) {
          req.flash("mensaje", "⚠️ No se agregaron códigos válidos.");
          return res.redirect("/codigos");
      }

      // 🔹 Verificar si los códigos ya existen
      const codigosExistentes = await Codigo.find({ valor: { $in: codigosValidos } });
      const codigosNuevos = codigosValidos.filter(c => !codigosExistentes.some(e => e.valor === c));

      if (codigosNuevos.length === 0) {
          req.flash("mensaje", "⚠️ Todos los códigos ya están registrados.");
          return res.redirect("/codigos");
      }

      // 🔹 Insertar códigos nuevos con fecha de agregado
      const codigosGuardar = codigosNuevos.map(c => ({ valor: c, duracion, fechaAgregado: new Date() }));
      await Codigo.insertMany(codigosGuardar);

      req.flash("mensaje", `✅ Se agregaron ${codigosGuardar.length} códigos correctamente.`);
      res.redirect("/codigos");
  } catch (error) {
      console.error(error);
      req.flash("mensaje", "❌ Hubo un error al agregar los códigos.");
      res.redirect("/codigos");
  }
});
  

// 📌 Ruta para eliminar un código
router.post("/eliminar/:id", async (req, res) => {
  try {
    await Codigo.findByIdAndDelete(req.params.id);
    res.redirect("/codigos");
  } catch (error) {
    console.error("Error al eliminar el código:", error);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;
