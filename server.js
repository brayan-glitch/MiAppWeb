require("dotenv").config({ path: "./.env" });
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');



const app = express();

// 📌 Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/miappweb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Conectado a MongoDB"))
.catch(err => console.error("❌ Error al conectar a MongoDB", err));

// 📌 Configuración de EJS y archivos estáticos
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// 📌 Middleware para procesar datos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📌 Configuración de sesiones (debe ir antes de las rutas)
app.use(session({
  secret: 'clave_secreta_segura',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/miappweb',
    ttl: 86400 // 1 día
  }),
  cookie: { maxAge: 86400000 } // 24 horas
}));

// 📌 Middleware para mensajes flash
app.use(flash());

// 📌 Middleware global para asegurar que la sesión del usuario esté disponible en todas las vistas
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null; // Asegura que siempre haya algo en `res.locals.usuario`
  res.locals.mensaje = req.flash('mensaje'); // Hace que los mensajes sean accesibles en todas las vistas
  next();
});

// 📌 Importar rutas (después de configurar la sesión)
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const menuRoutes = require('./routes/menu');
const codigosRoutes = require("./routes/codigos");
const comprarTiempoRoutes = require('./routes/comprar_tiempo');
const historialRoutes = require('./routes/historial');

// 📌 Definir rutas
app.use('/auth', authRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/menu', menuRoutes);
app.use("/codigos", codigosRoutes);
app.use('/comprar_tiempo', comprarTiempoRoutes);
app.use('/historial', historialRoutes);


// 📌 Redirigir a login si no hay sesión
app.get('/', (req, res) => res.redirect('/auth/login'));

// 📌 Iniciar servidor
app.listen(3000, () => console.log('🚀 Servidor en http://localhost:3000'));
