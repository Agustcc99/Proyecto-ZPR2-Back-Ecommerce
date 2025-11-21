E-Commerce *Agustin Tacconi Gianello *ZPR2-DISTANCIA-G

Sistema backend para la gestion de productos, usuarios y pedidos en un e-commerce.
 Desarrollado con Node.js, Express y MongoDB.

Tecnologias utilizadas
·	Node.js + Express
·	MongoDB + Mongoose
·	JSON Web Token (JWT)
·	Bcrypt para hash de contrasenas
·	Jest + Supertest para tests
·	Dotenv para variables de entorno

Arquitectura del proyecto
Estructura por cappas y modularizacion
src/
  app.js
  server.js
  config/
    database.js
  controllers/
    authController.js
    productController.js
    userController.js
    orderController.js
  middlewares/
    authMiddleware.js
    roleMiddleware.js
    validateRequest.js
    errorHandler.js
  models/
    User.js
    Product.js
    Order.js
  routes/
    auth.routes.js
    products.routes.js
    users.routes.js
    orders.routes.js
tests/
  setup.js
  auth.test.js
  product.test.js
  user.test.js
  order.test.j

Variables de entorno
En el archivo .env:
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce_api
MONGO_URI_TEST=mongodb://127.0.0.1:27017/ecommerce_api_test
JWT_SECRET=clave_super_secreta

Se utiliza una base separada para testing, permite correr los tests sin afectar los datos reales.

Endpoints principales

1. Autenticacion (/api/auth)
POST /api/auth/register
Crea un usuario nuevo.
 Body requerido:
{
  "name": "Texto",
  "email": "correo@test.com",
  "password": "123456"
}

POST /api/auth/login
Devuelve token JWT para autenticacion.

2. Usuarios (/api/users)
GET /api/users/me
Devuelve el perfil del usuario autenticado.
GET /api/users
Solo accesible para admin. Lista todos los usuarios registrados.

3. Productos (/api/products)
GET /api/products
Lista productos activos.
GET /api/products/:id
Obtiene un producto por ID.
POST /api/products
Requiere:
·	Token valido
·	Rol admin
Crea un producto nuevo.
PUT /api/products/:id
Actualiza un producto.
DELETE /api/products/:id
Elimina un producto mediante soft delete, cambiando active a false.

4. Pedidos (/api/orders)
POST /api/orders
Requiere rol cliente.
 Crea un pedido y descuenta stock.
Body requerido:
{
  "items": [
    { "productId": "...", "quantity": 2 }
  ]
}

GET /api/orders/my
Devuelve los pedidos del usuario autenticado.
GET /api/orders
Solo admin. Lista todos los pedidos.
PATCH /api/orders/:id/status
Actualiza el estado del pedido.
 Estados validos: pendiente, enviado, cancelado.

Middlewares
Middlewares para proteger y validar las rutas: authenticationToken verifica el JWT, authorizeRoles controla los permisos segun rol, validateRequest valida el cuerpo de las peticiones y errorHandler centraliza el manejo de errores.
——————————————————————————————————————-
**authMiddlware.js
authenticationToken
Verifica validez del token JWT y carga req.user.
——————————————————————————————————————-
**roleMiddleware.js
authorizeRoles
Restringe acceso segun el rol del usuario.
——————————————————————————————————————-
**validateRequest.js
validateProductBody
validateOrderBody
validateRegisterBody
——————————————————————————————————————-
**errorHandler.js
errorHandler
Manejo centralizado de errores.
——————————————————————————————————————-

Modelos de datos
*User
name: String
email: String (unico)
password: String (hash)
role: String (admin | cliente)

*Product
name, description, price, stock, image, active

*Order
user: referencia a User
items: [ product, quantity, price ]
status: pendiente | enviado | cancelado
total: number
timestamps

Testing
Se implementaron 24 tests automatizados usando Jest y Supertest.
 Los tests cubren completamente:
·	Registro y login
·	Validaciones de body
·	Permisos y roles
·	CRUD de productos
·	Soft delete
·	Creacion de pedidos
·	Control de stock
·	Listado de pedidos por usuario
·	Listado general de pedidos para admin
·	Cambios de estado del pedido

Cada test se ejecuta sobre una base de prueba
Para correrlos:
npx jest --runInBand
