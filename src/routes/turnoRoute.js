const express = require('express');
const turnoController = require('../controllers/turnoController');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.get('/', turnoController.obtenerTurnos);
router.get('/:id', turnoController.obtenerTurnoPorId);
router.post('/', verifyToken, turnoController.crearTurno);
router.put('/:id', verifyToken, turnoController.actualizarTurno);
router.delete('/:id', verifyToken, turnoController.eliminarTurno);

module.exports = router;
