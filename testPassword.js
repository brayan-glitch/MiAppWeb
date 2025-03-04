const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Usuario = require('./models/usuario'); // CORREGIDO: `usuario` en minúsculas

mongoose.connect('mongodb://localhost:27017/miappweb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function testPassword() {
    const user = await Usuario.findOne({ nombre: "admin" }); // CORREGIDO: `User` → `Usuario`

    if (!user) {
        console.log("❌ Usuario no encontrado");
        return;
    }

    const match = await bcrypt.compare("admin123", user.password);

    if (match) {
        console.log("✅ Contraseña correcta");
    } else {
        console.log("❌ Contraseña incorrecta");
    }
    
    mongoose.connection.close();
}

testPassword();
