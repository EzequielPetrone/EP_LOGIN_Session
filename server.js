//Importo y configuro Express y Socket.io (y el server http)
const express = require('express');
const app = express();
const { createServer } = require("http")
const { Server } = require("socket.io")
const httpServer = createServer(app);
const io = new Server(httpServer);

//Importo otras dependencias
const session = require('express-session');
const handlebars = require('express-handlebars');
const MongoStore = require('connect-mongo');

const { EXP_TIME, PORT, MONGO_URL } = require('./src/config/globals') // .env

const PRODMSG = 'prod_msg' //Constante que seteo tanto del lado del server como del cliente ya que deben coincidir.

//Importo routing
const router = require('./src/routes/router');

//Importo y seteo contenedor de productos
const { ProductosDaoMongo } = require('./src/daos/productos/ProductosDaoMongo')
const contenedorProd = new ProductosDaoMongo()

//Configuro el tratamiento de las sessions utilizando Mongo
app.use(session({
    store: MongoStore.create({ mongoUrl: MONGO_URL }),
    secret: 'clave_eze',
    cookie: {
        // httpOnly: false,
        // secure: false,
        maxAge: parseInt(EXP_TIME)
    },
    rolling: true,
    resave: false,
    saveUninitialized: false
}))

//Seteo views hbs para renderizar en el front
app.engine(
    "hbs",
    handlebars.engine({
        extname: ".hbs",
        defaultLayout: 'index.hbs',
        layoutsDir: __dirname + "/src/views/layouts",
        partialsDir: __dirname + "/src/views/partials/",
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        }
    })
);
app.set('view engine', 'hbs');
app.set('views', './src/views');

//Seteo Static
app.use('/static', express.static(__dirname + "/public"));

//Configuro Middleware de manejo de errores
const mwError = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err });
}
app.use(mwError)

//Seteo Router
app.use('/', router)

//Gestiono conexión con clientes utilizando socket.io
io.on('connection', async (socket) => {

    // console.log('Client connected:', socket.id);

    //Envío al nuevo socket los productos registrados al momento
    socket.emit(PRODMSG, await contenedorProd.getAll())

    //Recibo, guardo y retransmito Productos
    socket.on(PRODMSG, async (data) => {
        try {
            let newId = await contenedorProd.saveProducto(data)
            if (newId) {
                //Envío a todos los sockets los productos actualizados
                io.sockets.emit(PRODMSG, await contenedorProd.getAll());
            } else {
                throw 'Error al guardar nuevo producto'
            }
        } catch (error) {
            console.log(error);
        }
    });

    // socket.on('disconnect', () => console.log('Disconnected!', socket.id));
});

//Socket.io Error logging
io.engine.on("connection_error", (err) => {
    console.log(err.req);      // the request object
    console.log(err.code);     // the error code, for example 1
    console.log(err.message);  // the error message, for example "Session ID unknown"
    console.log(err.context);  // some additional error context
});

//Pongo a escuchar al server
try {
    httpServer.listen(PORT, () => console.log(`Server running. PORT: ${httpServer.address().port}`));

} catch (error) {
    //Si falla el listen al puerto estipulado pruebo que se me asigne automáticamente otro puerto libre...
    httpServer.listen(0, () => console.log(`Server running. PORT: ${httpServer.address().port}`));
}

//Server Error handling
httpServer.on("error", error => console.log('Error en el servidor:', error))