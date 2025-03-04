const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');
const Codigo = require('../models/codigo');
const Historial = require('../models/historial');

// Middleware para verificar sesión
const verificarSesion = (req, res, next) => {
    if (!req.session.usuario) {
        return res.redirect('/auth/login');
    }
    next();
};

// 📌 Mostrar la página de compra con saldo disponible
router.get('/', verificarSesion, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.session.usuario.id);
        if (!usuario) {
            return res.redirect('/auth/login');
        }

        res.render('comprar_tiempo/comprar_tiempo', {
            saldo: usuario.saldo
        });

    } catch (error) {
        console.error("❌ Error al obtener el saldo:", error);
        res.status(500).send("Error al cargar la página");
    }
});

// 📌 Procesar la compra de tiempo
router.post('/comprar', verificarSesion, async (req, res) => {
    const { duracion } = req.body;
    const usuarioId = req.session.usuario.id;

    try {
        // Obtener el usuario
        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
            return res.status(400).send("Usuario no encontrado");
        }

        // Buscar un código disponible según la duración
        const codigo = await Codigo.findOne({ duracion });
        if (!codigo) {
            return res.status(400).send("No hay códigos disponibles para esta duración");
        }

        // Definir precios
        const precios = {
            "1 Hora": 2000,
            "1 Día": 5000,
            "1 Semana": 20000,
            "1 Mes": 50000
        };

        const precio = precios[duracion];

        // Verificar saldo
        if (usuario.saldo < precio) {
            return res.status(400).send("Saldo insuficiente");
        }

        // Descontar saldo y actualizar usuario
        usuario.saldo -= precio;
        await usuario.save();

        // Guardar en historial
        await Historial.create({
            usuario: usuarioId,
            codigo: codigo.valor,
            duracion: duracion,
            fechaCompra: new Date()
           
        });

        // Eliminar el código de la base de datos
        await Codigo.deleteOne({ _id: codigo._id });

        res.render('comprar_tiempo/codigo_generado', { codigo: codigo.valor });

    } catch (error) {
        console.error("❌ Error al procesar la compra:", error);
        res.status(500).send("Error en el servidor");
    }
});

module.exports = router;
