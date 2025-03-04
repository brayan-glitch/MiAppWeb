const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');

// 📌 Middleware para proteger la ruta
function verificarSesion(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect('/auth/login');
    }
    next();
}

// 📌 Mostrar el menú y el saldo del usuario
router.get('/', verificarSesion, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.session.usuario.id);

        if (!usuario) {
            req.session.destroy();
            return res.redirect('/auth/login');
        }

        res.render('menu', { usuario });
    } catch (error) {
        console.error('❌ Error al cargar el menú:', error);
        res.status(500).send('Error en el servidor');
    }
});

module.exports = router;
