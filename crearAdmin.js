const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('./models/usuario'); // CORREGIDO: `usuario` en minúsculas

mongoose.connect('mongodb://localhost:27017/miappweb', {
  useNewUrlParser: true, 
  useUnifiedTopology: true
}).then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error en MongoDB:', err));

const crearAdmin = async () => {
  try {
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = new Usuario({
      nombre: 'admin',
      tipo: 'admin',
      saldo: 1000,
      password: passwordHash
    });

    await admin.save();
    console.log('✅ Usuario administrador creado: admin / admin123');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error al crear el usuario:', error);
    mongoose.connection.close();
  }
};

crearAdmin();
