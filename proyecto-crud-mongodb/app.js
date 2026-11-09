require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conectarDB = require('./src/config/db');

const usuarioRoute = require('./src/routes/usuarioRoute');
const mascotaRoute = require('./src/routes/mascotaRoute');
const servicioRoute = require('./src/routes/servicioRoute');
const turnoRoute = require('./src/routes/turnoRoute');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/usuarios', usuarioRoute);
app.use('/api/mascotas', mascotaRoute);
app.use('/api/servicios', servicioRoute);
app.use('/api/turnos', turnoRoute);

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});


app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'El cuerpo de la solicitud no es un JSON válido' });
  }
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    message: status === 500 ? 'Error interno del servidor' : err.message
  });
});

const PORT = process.env.PORT || 3000;

conectarDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
});
