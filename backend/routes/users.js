
const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController'); 

// Rutas de Autenticación
// POST /api/users/register (Registro)
router.post('/register', userController.register); // Implementar registro con hashing
// POST /api/users/login (Login y generación de JWT)
router.post('/login', userController.login); // Implementar login y generación de JWT


// Rutas CRUD Protegidas (Requieren JWT)

// POST /api/users/ - Se recomienda usar '/register' en su lugar.
// Se comenta la ruta POST original, ya que 'register' la reemplaza
// router.post('/', userController.createUser); 


// GET /api/users/ 
// Protegida: requiere un token válido para acceder
router.get('/', userController.getAllUsers); //

// GET /api/users/:id
// Protegida: requiere un token válido para acceder
router.get('/:id', userController.getUserById); //

// PUT /api/users/:id
// Protegida: requiere un token válido para acceder
router.put('/:id', userController.updateUser); //

// DELETE /api/users/:id
// Protegida: requiere un token válido para acceder
router.delete('/:id', userController.deleteUser); //

module.exports = router;