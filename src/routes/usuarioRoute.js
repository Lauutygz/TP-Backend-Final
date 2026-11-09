const express = require('express');
const usuarioController = require('../controllers/usuarioController');

const router = express.Router();

router.post('/register', usuarioController.registrar);
router.post('/login', usuarioController.login);

module.exports = router;
