const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');

// 📌 Mostrar formulario de inicio de sesión
router.get('/login', (req, res) => {
    res.render('login'); // Asegúrate de tener 'views/login.ejs'
});

// 📌 Login sin contraseña
router.post('/login', async (req, res) => {
    const { nombre } = req.body;

    try {
        const usuario = await Usuario.findOne({ nombre });

        if (!usuario) {
            console.log('❌ Usuario no encontrado:', nombre);
            return res.status(401).send('Usuario no encontrado');
        }

        // ✅ Guardar usuario en la sesión
        req.session.usuario = {
            id: usuario._id,
            nombre: usuario.nombre,
            tipo: usuario.tipo
        };

        console.log('✅ Usuario autenticado:', req.session.usuario);
        res.redirect('/menu');

    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).send('Error en el servidor');
    }
});

// 📌 Cerrar sesión
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('❌ Error al cerrar sesión:', err);
            return res.status(500).send('Error al cerrar sesión');
        }
        res.redirect('/auth/login');
    });
});

module.exports = router;
