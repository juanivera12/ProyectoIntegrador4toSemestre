// backend/server.js
const express = require('express');
const bodyParser = require('body-parser'); 
const usersRoutes = require('./routes/users'); // Importa las nuevas rutas

const app = express();
const PORT = 3000;

// Middleware: Permite que Express lea cuerpos de petición JSON (para POST y PUT)
app.use(bodyParser.json());

// CORS: Permitir peticiones desde el frontend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// SDK de Mercado Pago
const { MercadoPagoConfig, Preference } = require('mercadopago');
// Agrega credenciales
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-5297062915426978-090319-d6089e8ecdab5289c86405e84054f715-2670517922' });

app.post('/create_preference', async (req, res) => {
    try {
        const preference = new Preference(client);
        
        // Obtener items del body de la petición
        const { items } = req.body;
        
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ "error": "Items are required" });
        }
        
        // Crear la preferencia con los items recibidos
        const data = await preference.create({
            body: {
                items: items.map(item => ({
                    title: item.title,
                    quantity: parseInt(item.quantity),
                    unit_price: parseFloat(item.unit_price)
                })),
                back_urls: {
                    success: `${req.protocol}://${req.get('host')}/success`,
                    failure: `${req.protocol}://${req.get('host')}/failure`,
                    pending: `${req.protocol}://${req.get('host')}/pending`
                },
                auto_return: "approved"
            }
        });
        
        console.log('Preferencia creada:', data);
        
        // Retornar la información de la preferencia
        res.status(200).json({
            preference_id: data.id,
            preference_url: data.init_point || data.sandbox_init_point,
        });
    } catch (error) {
        console.error('Error al crear preferencia:', error);
        res.status(500).json({ "error": "error creating preference", "details": error.message });
    }
});

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