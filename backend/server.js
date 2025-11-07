// backend/server.js
const express = require("express");
const bodyParser = require("body-parser");
const usersRoutes = require("./routes/users"); // Importa las nuevas rutas
const db = require("./db") 

const app = express();
const PORT = 3000;

// Middleware: Permite que Express lea cuerpos de petición JSON (para POST y PUT)
app.use(bodyParser.json());

// CORS: Permitir peticiones desde el frontend
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// SDK de Mercado Pago
const { MercadoPagoConfig, Preference } = require("mercadopago");
// Agrega credenciales
const client = new MercadoPagoConfig({
  accessToken:
    "APP_USR-5297062915426978-090319-d6089e8ecdab5289c86405e84054f715-2670517922",
});

app.post("/create_preference", async (req, res) => {
  try {
    const preference = new Preference(client);

    const items = req.body.items || [];

    // Validar que items sea un array y no esté vacío
    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({
          error:
            "El carrito está vacío o la estructura de datos es incorrecta.",
        });
    }

    const itemsForPreference = items.map((item) => {
      // AGREGAR ESTO: Muestra el valor bruto antes de la validación
      console.log(
        `DEBUG: Item bruto recibido: {name: ${item.name}, price: ${item.price}, quantity: ${item.quantity}}`
      );

      const price =
        parseFloat(item.price || 0) <= 0 ? 0.01 : parseFloat(item.price);

      const quantity =
        parseInt(item.quantity || 1) <= 0 ? 1 : parseInt(item.quantity);

      return {
        title: item.name,
        quantity: quantity,
        unit_price: price,
        
      };
    });

    console.log(
      "Items FINALES a enviar a MP (deben tener precio > 0):",
      itemsForPreference
    );
    console.log("Items FINAL a enviar a MP:", itemsForPreference);

    if (itemsForPreference.length === 0) {
      return res
        .status(400)
        .json({ error: "No hay productos válidos para procesar." });
    }

    // Crear la preferencia con los items validados
    const data = await preference.create({
      body: {
        items: itemsForPreference,
        currency_id: "ARS",
        back_urls: {
          success: "https://www.google.com",
          failure: "https://www.google.com",
          pending: "https://www.google.com",
        },
        auto_return: "approved",
      },
    });

    console.log("Preferencia creada:", data);

    // Retornar la información de la preferencia
    res.status(200).json({
      preference_id: data.id,
      preference_url: data.init_point || data.sandbox_init_point,
    });
  } catch (error) {
    
    console.error("Error detallado de MP:", error);
    console.error("Mensaje de error:", error.message);
    
    res
      .status(500)
      .json({ error: "Error al contactar MP", details: error.message });
  }
});

// Montar las Rutas de Usuarios en el prefijo /api/users
app.use("/api/users", usersRoutes);

// Ruta de prueba simple
app.get("/", (req, res) => {
  res.send("API de Backend corriendo.");
});

// Iniciar el Servidor
app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});

app.post("/save_order", async (req, res) => {
  const id_user = 1;
  const { cartItems, totalPedido: total = 0 , paymentMethod = 'efectivo', mpTransactionId = null,name = "",address = " ",phone =" " } = req.body;
  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "El carrito está vacío." });
  }
  if (paymentMethod === "efectivo") {
      const orderNumber = `EF-${Date.now()}`;
        return res.status(201).json({ 
          message: "Pedido de efectivo procesado inmediatamente.", 
          id_pedido: 0, // 0 o null si no se inserta
          orderNumber: orderNumber 
      });
    }
  let connection;
  try {
    connection = await db.getConnection(); // Obtener una conexión del poolD
    await connection.beginTransaction();

    let orderStatus = "Pendiente";


    // 1. Insertar el pedido en la tabla Pedidos
    const insertPedidoQuery = `
      INSERT INTO Pedidos 
        (id_user, total, estado, id_transaccion_mp) 
      VALUES (?, ?,  ?, ?)
    `;
    const [result] = await connection.execute(insertPedidoQuery, [
      id_user, 
      total,
      orderStatus, 
      mpTransactionId
    ]);

    const id_pedido = result.insertId; // Obtener el ID del pedido recién insertado
    console.log(`Pedido insertado con ID: ${id_pedido}`);

    // 2. Insertar los detalles del pedido en detalle_pedido
    const detailPromises = cartItems.filter(item => item && item.id).map(item => {
      const quantity = parseInt(item.quantity) || 1;
      const priceAsNumber = parseFloat(item.price);
      const insertDetalleQuery = `
        INSERT INTO detalle_pedido 
          (id_pedido, id_producto, precio_unitario, cantidad) 
        VALUES (?, ?, ?, ?)
      `;
      return connection.execute(insertDetalleQuery, [
        id_pedido,
        item.id,        // id_producto
        priceAsNumber,          // precio_unitario  
        quantity,   // cantidad  
            
      ]);
    });

    await Promise.all(detailPromises); // Ejecutar todas las inserciones de detalle
    
    await connection.commit(); // Confirmar la transacción (guardar todo)

    res.status(201).json({ 
        message: "Pedido guardado exitosamente", 
        id_pedido,
        orderNumber: `FD${id_pedido}`
    });

  } catch (error) {
    if (connection) {
      await connection.rollback(); // Deshacer si hubo un error
    }
    console.error("Error al guardar el pedido:", error);
    res.status(500).json({ error: "Error interno al procesar el pedido." });
  } finally {
    if (connection) {
      connection.release(); // Liberar la conexión al pool
    }
  }
});

app.get("/", (req, res) => {
});