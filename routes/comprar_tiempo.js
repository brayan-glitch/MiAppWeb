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

// 📌 Procesar la compra de tiempo (hasta 10 códigos)
router.post('/comprar', verificarSesion, async (req, res) => {
    const { duracion, cantidad } = req.body;
    const usuarioId = req.session.usuario.id;
    const cantidadNumerica = parseInt(cantidad, 10);

    if (isNaN(cantidadNumerica) || cantidadNumerica < 1 || cantidadNumerica > 10) {
        return res.status(400).send("Cantidad inválida");
    }

    try {
        // Obtener el usuario
        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
            return res.status(400).send("Usuario no encontrado");
        }

        // Definir precios
        const precios = {
            "1 Hora": 2000,
            "1 Día": 5000,
            "1 Semana": 20000,
            "1 Mes": 50000
        };

        const precioUnitario = precios[duracion];
        if (!precioUnitario) {
            return res.status(400).send("Duración inválida");
        }

        const precioTotal = precioUnitario * cantidadNumerica;

        // Verificar saldo
        if (usuario.saldo < precioTotal) {
            return res.status(400).send("Saldo insuficiente");
        }

        // Buscar códigos disponibles
        const codigos = await Codigo.find({ duracion }).limit(cantidadNumerica);
        if (codigos.length < cantidadNumerica) {
            return res.status(400).send("No hay suficientes códigos disponibles");
        }

        // Descontar saldo y actualizar usuario
        usuario.saldo -= precioTotal;
        await usuario.save();

        // Guardar en historial y eliminar códigos de la base de datos
        const codigosGenerados = codigos.map(codigo => codigo.valor);
        await Historial.insertMany(
            codigos.map(codigo => ({
                usuario: usuarioId,
                codigo: codigo.valor,
                duracion: duracion,
                fechaCompra: new Date()
            }))
        );

        await Codigo.deleteMany({ _id: { $in: codigos.map(c => c._id) } });

        res.render('comprar_tiempo/codigo_generado', { codigos: codigosGenerados });

    } catch (error) {
        console.error("❌ Error al procesar la compra:", error);
        res.status(500).send("Error en el servidor");
    }
});

module.exports = router;
