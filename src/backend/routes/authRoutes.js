const { verifyToken } = require("../middleware/auth");
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

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
router.post('/verify-mfa', authController.verifyMfa);
router.get('/audit-log', verifyToken, authController.getAuditLog);
router.post('/users/reactivate', verifyToken, authController.reactivateUser);
router.put('/users/:id', verifyToken, authController.updateUser);
router.post('/public-signup', authController.publicSignup);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPasswordViaToken);

// ✅ SuperAdmin-only Hard Delete
router.delete("/admin/user/hard-delete/:id", verifyToken, authController.hardDeleteUser);

module.exports = router;