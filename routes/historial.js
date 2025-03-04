const express = require('express');
const router = express.Router();
const Historial = require('../models/historial');
const Usuario = require('../models/usuario');

// Middleware para verificar sesión
const verificarSesion = (req, res, next) => {
    if (!req.session || !req.session.usuario || !req.session.usuario.id) {
        return res.redirect('/auth/login');
    }
    next();
};

// 📌 Mostrar el historial de compras del usuario o de todos si es admin
router.get('/', verificarSesion, async (req, res) => {
    try {
        // Obtener el usuario actual
        const usuario = await Usuario.findById(req.session.usuario.id);

        if (!usuario) {
            req.session.destroy();
            return res.redirect('/auth/login');
        }

        let historial;

        if (usuario.tipo === 'admin') {
            // 📌 Si es administrador, ve todo el historial
            historial = await Historial.find()
                .populate({ path: 'usuario', select: 'nombre' })
                .sort({ fecha: -1 });
        } else {
            // 📌 Si es un usuario normal, solo ve su propio historial
            historial = await Historial.find({ usuario: usuario._id })
                .populate({ path: 'usuario', select: 'nombre' })
                .sort({ fecha: -1 });
        }

        console.log('Historial obtenido:', historial); // Debug para verificar datos

        res.render('historial/historial', { historial });
    } catch (error) {
        console.error('❌ Error al obtener el historial:', error);
        res.status(500).send('Error en el servidor');
    }
});

module.exports = router;
