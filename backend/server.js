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
    // server.js (dentro de app.post('/create_preference'))

   // server.js (dentro de app.post('/create_preference'))

    try {
        const preference = new Preference(client);
        
        // CORRECCIÓN CLAVE: Inicializar items como un array vacío si no existe en req.body
        const items = req.body.items || [];
        
        // La validación ahora es más limpia:
        if (!Array.isArray(items) || items.length === 0) {
            console.error('Error: El carrito está vacío o la estructura de datos es incorrecta. Recibido:', req.body);
            return res.status(400).json({ "error": "El carrito está vacío o la estructura de datos es incorrecta." });
        }
        
        console.log('Items recibidos del frontend:', items);

        // El resto del código de mapeo es correcto y robusto (debería funcionar)
        const itemsForPreference = items.map(item => {
            // ... (resto de la lógica de validación de quantity y price)
            let quantity = parseInt(item.quantity);
            if (isNaN(quantity) || quantity < 1) {
                quantity = 1; 
            }
            let price = parseFloat(item.price);
            if (isNaN(price) || price <= 0) {
                price = 0.01; 
            }
            return { 
                title: item.name,              
                quantity: quantity, 
                unit_price: price 
            };
        });
// ...

        // **DEPURACIÓN: Mostrar los ítems finales**
        console.log('Items FINAL a enviar a MP:', itemsForPreference); 

        if (itemsForPreference.length === 0) {
            return res.status(400).json({ "error": "No hay productos válidos para procesar." });
        }
        
        // Crear la preferencia con los items validados
        const data = await preference.create({
            body: {
                items: itemsForPreference, // Usamos el array ya filtrado y mapeado
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
        // IMPRESIÓN COMPLETA DEL OBJETO DE ERROR DE MERCADO PAGO
        console.error('Error detallado de MP:', error); 
        console.error('Mensaje de error:', error.message);
        // Usa error.cause[0].code para ver el código de error de la API (si está disponible)
        res.status(500).json({ "error": "Error al contactar MP", "details": error.message });
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