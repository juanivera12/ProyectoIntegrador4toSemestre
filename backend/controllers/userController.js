
const db = require('../db'); 
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 

// Clave secreta para JWTs (DEBE ser guardada de forma segura, ej: variables de entorno)
const JWT_SECRET = 'TU_SECRETO_ULTRA_SEGURO'; // CAMBIAR ESTO EN PRODUCCIÓN

// --- REGISTRO (Crear Usuario con Hashing de Contraseña) ---
exports.register = async (req, res) => {
    const { email, password, nombre } = req.body; 

    // 1. Validar datos básicos
    if (!email || !password || !nombre) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: email, password y nombre.' });
    }

    try {
        // 2. Hashing de la contraseña (usando 10 rounds de salt)
        const password_hash = await bcrypt.hash(password, 10); //

        // 3. Insertar usuario en la base de datos
        const [result] = await db.execute(
            'INSERT INTO user (email, password_hash, nombre) VALUES (?, ?, ?)',
            [email, password_hash, nombre]
        );

        // 4. Responder con éxito (sin exponer la contraseña)
        res.status(201).json({ 
            id: result.insertId, 
            email: email, 
            nombre: nombre, 
            message: 'Usuario registrado con éxito.' 
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El email ya está registrado.' });
        }
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// --- LOGIN (Autenticar Usuario y Generar JWT) ---
exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    // 1. Buscar usuario por email
    try {
        const [rows] = await db.execute('SELECT * FROM user WHERE email = ?', [email]);

        if (rows.length === 0) {
            // Usuario no encontrado o contraseña incorrecta
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const user = rows[0];

        // 2. Comparar la contraseña ingresada con el hash almacenado
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            // Contraseña incorrecta
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // 3. Generar JWT
        // Payload del token (datos del usuario a almacenar en el token)
        const tokenPayload = {
            id: user.id_user,
            email: user.email,
            nombre: user.nombre
        };
        // Generar el token con expiración de 1 hora
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' }); //

        // 4. Responder con el token
        res.json({ 
            message: 'Login exitoso.',
            token: token,
            user: {
                id: user.id_user,
                email: user.email,
                nombre: user.nombre
            }
        });

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// --- Middleware para Validar JWT (Requisito de Token) ---
exports.authenticateToken = (req, res, next) => { //
    // 1. Obtener el token del header Authorization
    const authHeader = req.headers['authorization'];
    // Formato: Bearer <TOKEN>
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) {
        // Si no hay token, acceso denegado
        return res.sendStatus(401); // Unauthorized
    }

    // 2. Verificar el token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Token inválido (expirado, modificado, etc.)
            return res.sendStatus(403); // Forbidden
        }
        
        // El token es válido, guardar los datos del usuario en la solicitud
        req.user = user; 
        next(); // Continuar con la siguiente función (el controlador de la ruta)
    });
};

// --- C: CREATE (Crear Usuario) ---
// La ruta POST '/' de usuarios se reemplazará por el registro, 
// pero se mantiene aquí el controlador original por si acaso, renombrado como createLegacy.
// Mejor usar la función register.
exports.createUser = async (req, res) => {
    // ESTA FUNCIÓN ESTÁ OBSOLETA. DEBES USAR exports.register
    // La dejé sin modificar su contenido para evitar conflictos
    const { email, password_hash, nombre } = req.body; 
    try {
        const [result] = await db.execute(
            'INSERT INTO user (email, password_hash, nombre) VALUES (?, ?, ?)',
            [email, password_hash, nombre]
        );
        res.status(201).json({ id: result.insertId, message: 'Usuario creado con éxito (sin hashing).' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El email ya está registrado.' });
        }
        console.error("Error al crear usuario:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};


// --- R: READ (Leer Usuarios) ---

// Leer TODOS los usuarios (Se aplica el middleware para proteger la ruta)
exports.getAllUsers = [exports.authenticateToken, async (req, res) => {
    // Solo se ejecuta si el token es válido
    try {
        // Opcionalmente, puedes usar req.user.id para filtrar y que solo vean sus propios datos
        // o si el usuario es administrador, ver todos.
        const [rows] = await db.query('SELECT id_user, email, nombre FROM user');
        res.json({ message: `Datos de todos los usuarios (acceso permitido a ${req.user.email})`, users: rows });
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
}];

// Leer UN usuario por ID (Se aplica el middleware para proteger la ruta)
exports.getUserById = [exports.authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT id_user, email, nombre FROM user WHERE id_user = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        res.json({ message: `Datos del usuario ${id} (acceso permitido a ${req.user.email})`, user: rows[0] });
    } catch (error) {
        console.error("Error al obtener usuario por ID:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
}];

// --- U: UPDATE (Actualizar Usuario) ---
// Se aplica el middleware para proteger la ruta
exports.updateUser = [exports.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { email, nombre } = req.body; 
    
    // Opcional: Implementar lógica de solo permitir al usuario actualizar su propio perfil
    // if (req.user.id !== parseInt(id)) {
    //     return res.status(403).json({ error: 'Acceso denegado. Solo puedes actualizar tu propio perfil.' });
    // }

    try {
        const [result] = await db.execute(
            'UPDATE user SET email = ?, nombre = ? WHERE id_user = ?',
            [email, nombre, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado para actualizar.' });
        }
        res.json({ message: `Usuario ${id} actualizado con éxito.` });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
}];

// --- D: DELETE (Eliminar Usuario) ---
// Se aplica el middleware para proteger la ruta
exports.deleteUser = [exports.authenticateToken, async (req, res) => {
    const { id } = req.params;
    
    // Opcional: Implementar lógica de solo permitir al usuario eliminar su propio perfil
    // if (req.user.id !== parseInt(id)) {
    //     return res.status(403).json({ error: 'Acceso denegado. Solo puedes eliminar tu propio perfil.' });
    // }
    
    try {
        const [result] = await db.execute('DELETE FROM user WHERE id_user = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado para eliminar.' });
        }
        res.json({ message: `Usuario ${id} eliminado con éxito.` });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
}];