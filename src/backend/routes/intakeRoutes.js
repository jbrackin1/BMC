const express = require('express');
const router = express.Router();
const intakeController = require('../controllers/intakeController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Admin submits intake form on behalf of patient
router.post('/submit', verifyToken, requireAdmin, intakeController.submitIntake);

// Patient views their own reports
router.get('/my-reports', verifyToken, intakeController.getMyReports);

module.exports = router;