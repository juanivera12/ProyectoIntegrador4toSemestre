// backend/server.js
const express = require('express');
const bodyParser = require('body-parser'); 
const usersRoutes = require('./routes/users'); // Importa las nuevas rutas

const app = express();
const PORT = 3000;

// Middleware: Permite que Express lea cuerpos de petición JSON (para POST y PUT)
app.use(bodyParser.json());

// Montar las Rutas de Usuarios en el prefijo /api/users
app.use('/api/users', usersRoutes);

// Ruta de prueba simple
app.get('/', (req, res) => {
    res.send('API de Backend corriendo.');
});

// Iniciar el Servidor
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});