const express = require('express');
const servicioController = require('../controllers/servicioController');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.get('/', servicioController.obtenerServicios);
router.get('/:id', servicioController.obtenerServicioPorId);
router.post('/', verifyToken, servicioController.crearServicio);
router.delete('/:id', verifyToken, servicioController.eliminarServicio);

module.exports = router;
