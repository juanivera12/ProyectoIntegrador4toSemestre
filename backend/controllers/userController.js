
const db = require('../db'); // Importamos la conexión desde db.js

// --- C: CREATE (Crear Usuario) ---
exports.createUser = async (req, res) => {
    
    const { email, password_hash, nombre } = req.body; 
    try {
        const [result] = await db.execute(
            'INSERT INTO user (email, password_hash, nombre) VALUES (?, ?, ?)',
            [email, password_hash, nombre]
        );
        res.status(201).json({ id: result.insertId, message: 'Usuario creado con éxito.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El email ya está registrado.' });
        }
        console.error("Error al crear usuario:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// --- R: READ (Leer Usuarios) ---

// Leer TODOS los usuarios (IMPORTANTE: Excluimos password_hash)
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id_user, email, nombre FROM user');
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Leer UN usuario por ID (Excluimos password_hash)
exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT id_user, email, nombre FROM user WHERE id_user = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Error al obtener usuario por ID:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// --- U: UPDATE (Actualizar Usuario) ---
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, nombre } = req.body; 
    try {
        const [result] = await db.execute(
            'UPDATE user SET email = ?, nombre = ? WHERE id_user = ?',
            [email, nombre, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado para actualizar.' });
        }
        res.json({ message: 'Usuario actualizado con éxito.' });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// --- D: DELETE (Eliminar Usuario) ---
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM user WHERE id_user = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado para eliminar.' });
        }
        res.json({ message: 'Usuario eliminado con éxito.' });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};