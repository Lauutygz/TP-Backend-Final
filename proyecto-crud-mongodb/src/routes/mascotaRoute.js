const express = require('express');
const mascotaController = require('../controllers/mascotaController');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.get('/', mascotaController.obtenerMascotas);
router.get('/:id', mascotaController.obtenerMascotaPorId);
router.post('/', verifyToken, mascotaController.crearMascota);

module.exports = router;
