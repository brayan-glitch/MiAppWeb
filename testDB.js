const mongoose = require('mongoose');
const User = require('./models/User'); // Asegúrate de que la ruta del modelo sea correcta

mongoose.connect('mongodb://localhost:27017/miappweb')
  .then(async () => {
    console.log('✅ Conectado a MongoDB');

    const usuarios = await User.find({});
    console.log('👤 Usuarios en la base de datos:', usuarios);

    mongoose.connection.close();
  })
  .catch(err => console.error('❌ Error de conexión:', err));
