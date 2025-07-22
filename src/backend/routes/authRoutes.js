const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', authController.login);

//POST /api/auth/create-user
router.post('/create-user', authController.createUser);

// GET /api/auth/user/:id
router.get('/user/:id', authController.getUserById);

//GET /api/auth/get-all-users
router.get('/get-all-users', authController.getAllUsers);

//POST /api/auth/reset-password
router.patch('/reset-password', authController.resetUserPassword);

//DELETE /api/auth/delete-password
router.delete('/user/:id', authController.deleteUser);

module.exports = router;