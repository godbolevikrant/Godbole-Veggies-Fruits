const express = require('express');
const router = express.Router();
const { register, login, status } = require('../controllers/usersController');

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Auth status/config check
router.get('/status', status);

module.exports = router;
