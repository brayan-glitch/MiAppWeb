const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/usuario'); // Asegúrate de que la ruta sea correcta

// Conéctate a MongoDB
mongoose.connect('mongodb://localhost:27017/miappweb')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

const actualizarContraseña = async (nombreUsuario, nuevaContraseña) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaContraseña, salt);

    const usuario = await User.findOneAndUpdate(
      { username: nombreUsuario }, // Cambia "username" por el nombre real del campo en tu modelo
      { password: hashedPassword },
      { new: true }
    );

    if (!usuario) {
      console.log('Usuario no encontrado');
    } else {
      console.log('Contraseña actualizada con éxito');
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error actualizando contraseña:', error);
    mongoose.connection.close();
  }
};

// Llamar a la función con el nombre del usuario
actualizarContraseña('brueba 002', 'nuevaContraseña123');
