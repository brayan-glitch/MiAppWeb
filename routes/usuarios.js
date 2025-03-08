const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');
const HistorialRecarga = require('../models/historialRecargas'); // 📌 Importamos el historial de recargas

// 📌 Middleware para verificar si es administrador
function verificarAdmin(req, res, next) {
    if (!req.session.usuario || req.session.usuario.tipo !== 'admin') {
        return res.status(403).send('Acceso denegado');
    }
    next();
}

// 📌 Ver lista de usuarios (solo administradores)
router.get('/', verificarAdmin, async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.render('usuarios', { usuarios });
    } catch (error) {
        console.error('❌ Error al obtener usuarios:', error);
        res.status(500).send('Error al obtener usuarios');
    }
});

// 📌 Crear un nuevo usuario (solo administradores)
router.post('/crear', verificarAdmin, async (req, res) => {
    const { nombre, telefono, localidad, tipo, saldo } = req.body;

    try {
        const nuevoUsuario = new Usuario({ nombre, telefono, localidad, tipo, saldo });
        await nuevoUsuario.save();
        console.log('✅ Usuario creado:', nuevoUsuario);
        console.log('Teléfono:', telefono);
        console.log('Localidad:', localidad);
        res.redirect('/usuarios');
    } catch (error) {
        console.error('❌ Error al crear usuario:', error);
        res.status(500).send('Error al crear usuario');
    }
});

// 📌 Recargar saldo con porcentaje opcional y guardar en historial (solo administradores)
router.post('/recargar', verificarAdmin, async (req, res) => {
    const { usuarioId, monto, porcentaje } = req.body;

    try {
        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) return res.status(404).send('Usuario no encontrado');

        let montoFinal = parseFloat(monto);
        let porcentajeAplicado = 0;
        if (porcentaje && !isNaN(porcentaje)) {
            porcentajeAplicado = (montoFinal * (parseFloat(porcentaje) / 100));
            montoFinal += porcentajeAplicado;
        }

        usuario.saldo += montoFinal;
        await usuario.save();

        // 📌 Guardamos en el historial de recargas
        const nuevaRecarga = new HistorialRecarga({
            usuario: usuario._id,
            cantidad: parseFloat(monto),
            porcentaje: parseFloat(porcentaje) || 0,
            totalFinal: montoFinal
        });
        await nuevaRecarga.save();

        console.log(`✅ Recarga: ${monto} + ${porcentaje || 0}% → Total: ${montoFinal} para ${usuario.nombre}`);
        res.redirect('/usuarios');
    } catch (error) {
        console.error('❌ Error al recargar saldo:', error);
        res.status(500).send('Error al recargar saldo');
    }
});

// 📌 Eliminar usuario (solo administradores)
router.post('/eliminar', verificarAdmin, async (req, res) => {
    const { usuarioId } = req.body;

    try {
        await Usuario.findByIdAndDelete(usuarioId);
        console.log('✅ Usuario eliminado');
        res.redirect('/usuarios');
    } catch (error) {
        console.error('❌ Error al eliminar usuario:', error);
        res.status(500).send('Error al eliminar usuario');
    }
});

// 📌 Cerrar sesión
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          console.error('❌ Error al cerrar sesión:', err);
          return res.status(500).send('Error al cerrar sesión');
      }
      res.redirect('/auth/login'); // Redirige al login después de cerrar sesión
  });
});

module.exports = router;
