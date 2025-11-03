// backend/server.js
import express from 'express';
import bodyParser from 'body-parser';
import usersRoutes from './routes/users.js';// Importa las nuevas rutas

const app = express();
const PORT = 3000;

// SDK de Mercado Pago
import { MercadoPagoConfig, Preference } from 'mercadopago';
// Agrega credenciales
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-5297062915426978-090319-d6089e8ecdab5289c86405e84054f715-2670517922' });

app.post('/create_preference', async (req, res) => {
    const preference = new Preference(client);

preference.create({
  body: {
    items: [
      {
        title: 'Mi producto',
        quantity: 1,
        unit_price: 2000
      }
    ],
  }
})
.then(data => {
    console.log(data);
    // objeto data tiene la información de la preferencia creada
    res.status(200).json({
        preference_id: data.id,
        preference_url: data.init_point,
    });
  })
  .catch(() => {
    res.status(500).json({ "error": "error creating preference"})
  });
});

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