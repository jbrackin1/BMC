const { verifyToken } = require("../middleware/auth");
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// // POST /api/auth/login
// router.post('/login', authController.login);

// //POST /api/auth/create-user
// router.post('/create-user', authController.createUser);

// // GET /api/auth/user/:id
// router.get('/user/:id', authController.getUserById);

// //GET /api/auth/get-all-users
// router.get('/get-all-users', authController.getAllUsers);

// //POST /api/auth/reset-password
// router.patch('/reset-password', authController.resetUserPassword);

// //DELETE /api/auth/delete-password
// router.delete('/user/:id', authController.deleteUser);







// 🔐 Public routes
router.post("/login", authController.login);         // Login and sets HttpOnly cookie
router.post("/logout", authController.logout);       // Clears the cookie

// 👤 Authenticated user session check
router.get("/me", verifyToken, authController.getMe); // Gets user from verified JWT

// 🛡️ Admin-only protected routes
router.post("/create-user", verifyToken, authController.createUser);
router.get("/users/:id", verifyToken, authController.getUserById);
router.get("/users", verifyToken, authController.getAllUsers);
router.post("/users/reset-password", verifyToken, authController.resetUserPassword);
router.delete("/users/:id", verifyToken, authController.deleteUser);

module.exports = router;