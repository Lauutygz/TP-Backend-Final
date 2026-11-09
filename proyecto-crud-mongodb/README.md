# API de Turnos para Clínica Veterinaria

API RESTful desarrollada con Node.js, Express y MongoDB (Mongoose) para gestionar los turnos de una clínica veterinaria. Los clientes (dueños) reservan turnos para sus mascotas, los veterinarios los atienden y los administradores gestionan el catálogo de servicios.

El proyecto implementa las operaciones CRUD, separa la lógica de negocio en una **capa de servicios** (`src/services/`) y deja en los controladores solo el manejo de la solicitud y la respuesta HTTP. La autenticación se hace con JWT y las contraseñas se guardan hasheadas con bcrypt.

---

## Esquema de la DB

Base de datos MongoDB con 4 colecciones. Las relaciones entre colecciones se modelan como **referencias** (campos `ObjectId` que apuntan al `_id` de otra colección).

### `usuarios`

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `_id` | ObjectId | sí | Identificador único |
| `nombre` | String | sí | Nombre completo |
| `email` | String | sí | Único, se guarda en minúsculas |
| `password` | String | sí | Hash de bcrypt (mínimo 6 caracteres antes de hashear). No se devuelve en las consultas |
| `rol` | String | no | `admin` \| `veterinario` \| `cliente` (por defecto `cliente`) |
| `telefono` | String | sí | Contacto |
| `activo` | Boolean | no | Por defecto `true` |
| `created_at` | Date | auto | Fecha de alta |

### `mascotas`

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `_id` | ObjectId | sí | Identificador único |
| `dueño_id` | ObjectId | sí | Referencia a `usuarios` (rol `cliente`) |
| `nombre` | String | sí | Nombre de la mascota |
| `especie` | String | sí | Perro, gato, etc. |
| `raza` | String | no | Raza |
| `edad` | Number | no | Edad en años |
| `historial_medico` | Array | no | Embebido: `[ { fecha: Date, observacion: String } ]` |

### `servicios`

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `_id` | ObjectId | sí | Identificador único |
| `nombre` | String | sí | Ej. "Consulta general" |
| `descripcion` | String | no | Detalle del servicio |
| `precio` | Number | sí | Precio vigente |
| `duracion_minutos` | Number | sí | Duración estimada |
| `categoria` | String | sí | Ej. "clínica", "estética", "prevención" |
| `activo` | Boolean | no | Por defecto `true` |

### `turnos`

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `_id` | ObjectId | sí | Identificador único |
| `mascota_id` | ObjectId | sí | Referencia a `mascotas` |
| `cliente_id` | ObjectId | sí | Referencia a `usuarios` (rol `cliente`, dueño de la mascota) |
| `veterinario_id` | ObjectId | sí | Referencia a `usuarios` (rol `veterinario`) |
| `servicio_id` | ObjectId | sí | Referencia a `servicios` |
| `servicio_snapshot` | Object | auto | Embebido: `{ nombre, precio, duracion_minutos }`. Copia del servicio al momento de reservar |
| `fecha` | Date | sí | Fecha y hora del turno |
| `estado` | String | no | `pendiente` \| `confirmado` \| `completado` \| `cancelado` (por defecto `pendiente`) |
| `notas` | String | no | Observaciones |
| `created_at` | Date | auto | Fecha de creación |

### Relaciones

- `usuarios` 1:N `mascotas` (por `dueño_id`)
- `usuarios` 1:N `turnos` (por `cliente_id` y por `veterinario_id`)
- `mascotas` 1:N `turnos` (por `mascota_id`)
- `servicios` 1:N `turnos` (por `servicio_id`)

**Referenciar vs. embeber:** `servicios` es una colección aparte porque se reutiliza en muchos turnos y se administra de forma independiente. Aun así, cada turno guarda un `servicio_snapshot` embebido con el precio, nombre y duración vigentes cuando se reservó, para que un cambio posterior en el catálogo no altere turnos ya creados. `historial_medico` se embebe en `mascotas` porque solo se usa junto con su mascota.

### Índices

| Colección | Índice | Para qué sirve |
|---|---|---|
| `usuarios` | `{ email: 1 }` único | Evitar emails duplicados |
| `usuarios` | `{ rol: 1 }` | Filtrar por rol (ej. veterinarios) |
| `mascotas` | `{ dueño_id: 1 }` | Listar las mascotas de un cliente |
| `servicios` | `{ categoria: 1 }` | Filtrar el catálogo por categoría |
| `turnos` | `{ veterinario_id: 1, fecha: 1 }` | Agenda de un veterinario por fecha |
| `turnos` | `{ cliente_id: 1, fecha: -1 }` | Historial de turnos de un cliente |
| `turnos` | `{ servicio_id: 1 }` | Turnos asociados a un servicio |

---

## Tecnologías utilizadas

- Node.js (v18 o superior)
- Express
- MongoDB + Mongoose
- bcrypt (hash de contraseñas)
- jsonwebtoken (autenticación JWT)
- dotenv (variables de entorno)
- cors

---

## Cómo correr el proyecto

Requisitos: Node.js 18+ y una base MongoDB (local o en MongoDB Atlas).

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd proyecto-crud-mongodb

# 2. Instalar dependencias
npm install

# 3. Revisar/ajustar el archivo .env (ver sección "Archivo .env")

# 4. Ejecutar
npm start
```

El servidor queda disponible en `http://localhost:3000` (o el puerto definido en `.env`). Para desarrollo con recarga automática: `npm run dev`.

---

## Endpoints

Las rutas marcadas con 🔒 requieren el header `Authorization: Bearer <token>` (el token se obtiene en el login).

### Usuarios y autenticación

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/usuarios/register` | No | Registrar un usuario |
| POST | `/api/usuarios/login` | No | Iniciar sesión y obtener el JWT |

### Servicios

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/servicios` | No | Listar servicios |
| GET | `/api/servicios/:id` | No | Obtener un servicio |
| POST | `/api/servicios` | 🔒 | Crear un servicio |
| DELETE | `/api/servicios/:id` | 🔒 | Eliminar un servicio (si no tiene turnos asociados) |

### Mascotas

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/mascotas` | No | Listar mascotas |
| GET | `/api/mascotas/:id` | No | Obtener una mascota |
| POST | `/api/mascotas` | 🔒 | Crear una mascota |

### Turnos

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/turnos` | No | Listar turnos (con `populate` de las referencias) |
| GET | `/api/turnos/:id` | No | Obtener un turno (con `populate`) |
| POST | `/api/turnos` | 🔒 | Crear un turno |
| PUT | `/api/turnos/:id` | 🔒 | Actualizar `fecha`, `estado` y/o `notas` |
| DELETE | `/api/turnos/:id` | 🔒 | Eliminar un turno |

---

## Ejemplos de datos Mock (JSON)

Los ejemplos usan los mismos IDs entre sí, por lo que las referencias son coherentes entre colecciones. Al crear un turno, el precio del `servicio_snapshot` es el que tiene el servicio en ese momento; si el servicio cambia de precio más adelante, los turnos ya creados conservan el valor original.

### POST `/api/usuarios/register`

Request:

```json
{
  "nombre": "Juan Pérez",
  "email": "juan.perez@gmail.com",
  "password": "cliente123",
  "rol": "cliente",
  "telefono": "+54 11 5555-3333"
}
```

Response `201`:

```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9c03",
  "nombre": "Juan Pérez",
  "email": "juan.perez@gmail.com",
  "rol": "cliente",
  "telefono": "+54 11 5555-3333",
  "activo": true,
  "created_at": "2026-10-05T14:20:00.000Z"
}
```

Para crear un veterinario (o un admin) se envía otro `rol`:

```json
{
  "nombre": "Dra. Carla Gómez",
  "email": "carla.gomez@vetclinic.com",
  "password": "vet12345",
  "rol": "veterinario",
  "telefono": "+54 11 4000-2222"
}
```

### POST `/api/usuarios/login`

Request:

```json
{
  "email": "carla.gomez@vetclinic.com",
  "password": "vet12345"
}
```

Response `200`:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "665f1a2b3c4d5e6f7a8b9c02",
    "nombre": "Dra. Carla Gómez",
    "email": "carla.gomez@vetclinic.com",
    "rol": "veterinario"
  }
}
```

Response `401` (credenciales incorrectas):

```json
{ "message": "Credenciales inválidas" }
```

### GET `/api/servicios`

Response `200`:

```json
[
  {
    "_id": "665f1a2b3c4d5e6f7a8b9e01",
    "nombre": "Consulta general",
    "descripcion": "Chequeo clínico de rutina",
    "precio": 5500,
    "duracion_minutos": 30,
    "categoria": "clínica",
    "activo": true
  },
  {
    "_id": "665f1a2b3c4d5e6f7a8b9e02",
    "nombre": "Vacunación antirrábica",
    "descripcion": "Aplicación de vacuna anual antirrábica",
    "precio": 3500,
    "duracion_minutos": 15,
    "categoria": "prevención",
    "activo": true
  },
  {
    "_id": "665f1a2b3c4d5e6f7a8b9e03",
    "nombre": "Baño y peluquería",
    "descripcion": "Baño, corte y cepillado",
    "precio": 4000,
    "duracion_minutos": 60,
    "categoria": "estética",
    "activo": true
  }
]
```

### GET `/api/servicios/:id`

Ejemplo: `GET /api/servicios/665f1a2b3c4d5e6f7a8b9e01`

Response `200`:

```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9e01",
  "nombre": "Consulta general",
  "descripcion": "Chequeo clínico de rutina",
  "precio": 5500,
  "duracion_minutos": 30,
  "categoria": "clínica",
  "activo": true
}
```

Response `404`:

```json
{ "message": "Servicio no encontrado" }
```

### POST `/api/servicios` 🔒

Request:

```json
{
  "nombre": "Consulta general",
  "descripcion": "Chequeo clínico de rutina",
  "precio": 5500,
  "duracion_minutos": 30,
  "categoria": "clínica"
}
```

Response `201`:

```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9e01",
  "nombre": "Consulta general",
  "descripcion": "Chequeo clínico de rutina",
  "precio": 5500,
  "duracion_minutos": 30,
  "categoria": "clínica",
  "activo": true
}
```

Response `401` (sin token):

```json
{ "message": "Token no proporcionado" }
```

### DELETE `/api/servicios/:id` 🔒

Ejemplo: `DELETE /api/servicios/665f1a2b3c4d5e6f7a8b9e03`

Response `200`:

```json
{ "message": "Servicio eliminado correctamente" }
```

Response `409` (servicio con turnos, ej. `.../665f1a2b3c4d5e6f7a8b9e01`):

```json
{ "message": "No se puede eliminar: el servicio está referenciado por turnos existentes" }
```

### POST `/api/mascotas` 🔒

Request:

```json
{
  "dueño_id": "665f1a2b3c4d5e6f7a8b9c03",
  "nombre": "Rocky",
  "especie": "Perro",
  "raza": "Labrador",
  "edad": 4,
  "historial_medico": [
    { "fecha": "2026-10-12T00:00:00.000Z", "observacion": "Aplicación de vacuna antirrábica anual" }
  ]
}
```

Response `201`:

```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9d01",
  "dueño_id": "665f1a2b3c4d5e6f7a8b9c03",
  "nombre": "Rocky",
  "especie": "Perro",
  "raza": "Labrador",
  "edad": 4,
  "historial_medico": [
    { "fecha": "2026-10-12T00:00:00.000Z", "observacion": "Aplicación de vacuna antirrábica anual" }
  ]
}
```

### GET `/api/mascotas`

Response `200`:

```json
[
  {
    "_id": "665f1a2b3c4d5e6f7a8b9d01",
    "dueño_id": "665f1a2b3c4d5e6f7a8b9c03",
    "nombre": "Rocky",
    "especie": "Perro",
    "raza": "Labrador",
    "edad": 4,
    "historial_medico": [
      { "fecha": "2026-10-12T00:00:00.000Z", "observacion": "Aplicación de vacuna antirrábica anual" }
    ]
  },
  {
    "_id": "665f1a2b3c4d5e6f7a8b9d03",
    "dueño_id": "665f1a2b3c4d5e6f7a8b9c04",
    "nombre": "Toby",
    "especie": "Perro",
    "raza": "Beagle",
    "edad": 6,
    "historial_medico": [
      { "fecha": "2026-10-15T00:00:00.000Z", "observacion": "Control de rutina, sin novedades" }
    ]
  }
]
```

### GET `/api/mascotas/:id`

Ejemplo: `GET /api/mascotas/665f1a2b3c4d5e6f7a8b9d01`

Response `200`:

```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9d01",
  "dueño_id": "665f1a2b3c4d5e6f7a8b9c03",
  "nombre": "Rocky",
  "especie": "Perro",
  "raza": "Labrador",
  "edad": 4,
  "historial_medico": [
    { "fecha": "2026-10-12T00:00:00.000Z", "observacion": "Aplicación de vacuna antirrábica anual" }
  ]
}
```

### POST `/api/turnos` 🔒

Request (el `servicio_snapshot` lo arma el servidor a partir del servicio):

```json
{
  "mascota_id": "665f1a2b3c4d5e6f7a8b9d01",
  "cliente_id": "665f1a2b3c4d5e6f7a8b9c03",
  "veterinario_id": "665f1a2b3c4d5e6f7a8b9c02",
  "servicio_id": "665f1a2b3c4d5e6f7a8b9e01",
  "fecha": "2026-11-16T10:00:00.000Z",
  "notas": "Control post-vacuna"
}
```

Response `201`:

```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9f01",
  "mascota_id": "665f1a2b3c4d5e6f7a8b9d01",
  "cliente_id": "665f1a2b3c4d5e6f7a8b9c03",
  "veterinario_id": "665f1a2b3c4d5e6f7a8b9c02",
  "servicio_id": "665f1a2b3c4d5e6f7a8b9e01",
  "servicio_snapshot": {
    "nombre": "Consulta general",
    "precio": 5500,
    "duracion_minutos": 30
  },
  "fecha": "2026-11-16T10:00:00.000Z",
  "estado": "pendiente",
  "notas": "Control post-vacuna",
  "created_at": "2026-11-09T09:00:00.000Z"
}
```

Response `400` (la mascota no es del cliente indicado):

```json
{ "message": "La mascota no pertenece al cliente indicado" }
```

### GET `/api/turnos`

Las referencias se devuelven con sus datos completos (`populate`).

Response `200`:

```json
[
  {
    "_id": "665f1a2b3c4d5e6f7a8b9f01",
    "mascota_id": {
      "_id": "665f1a2b3c4d5e6f7a8b9d01",
      "dueño_id": "665f1a2b3c4d5e6f7a8b9c03",
      "nombre": "Rocky",
      "especie": "Perro",
      "raza": "Labrador",
      "edad": 4,
      "historial_medico": [
        { "fecha": "2026-10-12T00:00:00.000Z", "observacion": "Aplicación de vacuna antirrábica anual" }
      ]
    },
    "cliente_id": {
      "_id": "665f1a2b3c4d5e6f7a8b9c03",
      "nombre": "Juan Pérez",
      "email": "juan.perez@gmail.com",
      "telefono": "+54 11 5555-3333"
    },
    "veterinario_id": {
      "_id": "665f1a2b3c4d5e6f7a8b9c02",
      "nombre": "Dra. Carla Gómez",
      "email": "carla.gomez@vetclinic.com",
      "telefono": "+54 11 4000-2222"
    },
    "servicio_id": {
      "_id": "665f1a2b3c4d5e6f7a8b9e01",
      "nombre": "Consulta general",
      "descripcion": "Chequeo clínico de rutina",
      "precio": 5500,
      "duracion_minutos": 30,
      "categoria": "clínica",
      "activo": true
    },
    "servicio_snapshot": {
      "nombre": "Consulta general",
      "precio": 5500,
      "duracion_minutos": 30
    },
    "fecha": "2026-11-16T10:00:00.000Z",
    "estado": "pendiente",
    "notas": "Control post-vacuna",
    "created_at": "2026-11-09T09:00:00.000Z"
  },
  {
    "_id": "665f1a2b3c4d5e6f7a8b9f02",
    "mascota_id": {
      "_id": "665f1a2b3c4d5e6f7a8b9d03",
      "dueño_id": "665f1a2b3c4d5e6f7a8b9c04",
      "nombre": "Toby",
      "especie": "Perro",
      "raza": "Beagle",
      "edad": 6,
      "historial_medico": [
        { "fecha": "2026-10-15T00:00:00.000Z", "observacion": "Control de rutina, sin novedades" }
      ]
    },
    "cliente_id": {
      "_id": "665f1a2b3c4d5e6f7a8b9c04",
      "nombre": "Ana Torres",
      "email": "ana.torres@gmail.com",
      "telefono": "+54 11 5555-4444"
    },
    "veterinario_id": {
      "_id": "665f1a2b3c4d5e6f7a8b9c02",
      "nombre": "Dra. Carla Gómez",
      "email": "carla.gomez@vetclinic.com",
      "telefono": "+54 11 4000-2222"
    },
    "servicio_id": {
      "_id": "665f1a2b3c4d5e6f7a8b9e02",
      "nombre": "Vacunación antirrábica",
      "descripcion": "Aplicación de vacuna anual antirrábica",
      "precio": 3500,
      "duracion_minutos": 15,
      "categoria": "prevención",
      "activo": true
    },
    "servicio_snapshot": {
      "nombre": "Vacunación antirrábica",
      "precio": 3500,
      "duracion_minutos": 15
    },
    "fecha": "2026-11-17T11:30:00.000Z",
    "estado": "pendiente",
    "notas": "",
    "created_at": "2026-11-09T10:15:00.000Z"
  }
]
```

### GET `/api/turnos/:id`

Ejemplo: `GET /api/turnos/665f1a2b3c4d5e6f7a8b9f02`

Response `200`:

```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9f02",
  "mascota_id": {
    "_id": "665f1a2b3c4d5e6f7a8b9d03",
    "dueño_id": "665f1a2b3c4d5e6f7a8b9c04",
    "nombre": "Toby",
    "especie": "Perro",
    "raza": "Beagle",
    "edad": 6,
    "historial_medico": [
      { "fecha": "2026-10-15T00:00:00.000Z", "observacion": "Control de rutina, sin novedades" }
    ]
  },
  "cliente_id": {
    "_id": "665f1a2b3c4d5e6f7a8b9c04",
    "nombre": "Ana Torres",
    "email": "ana.torres@gmail.com",
    "telefono": "+54 11 5555-4444"
  },
  "veterinario_id": {
    "_id": "665f1a2b3c4d5e6f7a8b9c02",
    "nombre": "Dra. Carla Gómez",
    "email": "carla.gomez@vetclinic.com",
    "telefono": "+54 11 4000-2222"
  },
  "servicio_id": {
    "_id": "665f1a2b3c4d5e6f7a8b9e02",
    "nombre": "Vacunación antirrábica",
    "descripcion": "Aplicación de vacuna anual antirrábica",
    "precio": 3500,
    "duracion_minutos": 15,
    "categoria": "prevención",
    "activo": true
  },
  "servicio_snapshot": {
    "nombre": "Vacunación antirrábica",
    "precio": 3500,
    "duracion_minutos": 15
  },
  "fecha": "2026-11-17T11:30:00.000Z",
  "estado": "pendiente",
  "notas": "",
  "created_at": "2026-11-09T10:15:00.000Z"
}
```

Response `404` (turno inexistente):

```json
{ "message": "Turno no encontrado" }
```

### PUT `/api/turnos/:id` 🔒

Campos modificables: `fecha`, `estado` y `notas`.

Ejemplo: `PUT /api/turnos/665f1a2b3c4d5e6f7a8b9f01`

Request:

```json
{
  "estado": "confirmado",
  "notas": "Cliente confirmó por teléfono"
}
```

Response `200`:

```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9f01",
  "mascota_id": "665f1a2b3c4d5e6f7a8b9d01",
  "cliente_id": "665f1a2b3c4d5e6f7a8b9c03",
  "veterinario_id": "665f1a2b3c4d5e6f7a8b9c02",
  "servicio_id": "665f1a2b3c4d5e6f7a8b9e01",
  "servicio_snapshot": {
    "nombre": "Consulta general",
    "precio": 5500,
    "duracion_minutos": 30
  },
  "fecha": "2026-11-16T10:00:00.000Z",
  "estado": "confirmado",
  "notas": "Cliente confirmó por teléfono",
  "created_at": "2026-11-09T09:00:00.000Z"
}
```

Response `400` (estado inválido):

```json
{ "message": "Validation failed: estado: El estado debe ser pendiente, confirmado, completado o cancelado" }
```

### DELETE `/api/turnos/:id` 🔒

Ejemplo: `DELETE /api/turnos/665f1a2b3c4d5e6f7a8b9f02`

Response `200`:

```json
{ "message": "Turno eliminado correctamente" }
```

---

## Funcionalidades

**Implementadas**

- CRUD completo de turnos (crear, listar, obtener, actualizar y eliminar).
- Alta, listado, consulta y baja de servicios; alta, listado y consulta de mascotas.
- Registro de usuarios con roles (`admin`, `veterinario`, `cliente`) y login con JWT.
- Contraseñas hasheadas con bcrypt mediante un `pre-save` hook de Mongoose.
- Middleware `verifyToken` que protege las rutas de creación, actualización y eliminación.
- Capa de servicios con la lógica de negocio: validación de que las referencias existan, que la mascota pertenezca al cliente, que el cliente y el veterinario tengan el rol correcto y estén activos, copia del servicio (`servicio_snapshot`) al crear el turno y bloqueo de la baja de servicios con turnos asociados.
- `populate` de las referencias en las lecturas de turnos.
- Manejo de códigos HTTP (200, 201, 400, 401, 404, 409, 500) y de excepciones con `try/catch`, incluyendo respuesta JSON ante un body con JSON mal formado.
- Variables de entorno con dotenv y CORS habilitado.

**A futuro**

- Edición de servicios (por ejemplo, para actualizar precios).
- Autorización por rol (que solo `admin` gestione servicios y solo `veterinario` modifique estados) y restricción del alta de usuarios con roles privilegiados.
- Filtros en el listado de turnos (por veterinario, cliente, fecha o estado) y paginación.
- Validación de superposición de horarios en la agenda de un veterinario.
- Front end.

---

## Archivo `.env`

El repositorio incluye un archivo `.env` de ejemplo con valores de prueba/placeholder:

```env
# Puerto donde corre el servidor
PORT=3000

# Cadena de conexión a MongoDB (ejemplo local)
MONGODB_URI=mongodb://127.0.0.1:27017/veterinaria
# Ejemplo con MongoDB Atlas (reemplazar los placeholders):
# MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/veterinaria

# Clave secreta para firmar los JWT (placeholder: cambiarla por una propia)
JWT_SECRET=cambiar_por_una_clave_secreta_larga
```
