var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require('cors');

const mongoose = require("mongoose");
const https = require("https");
const fs = require("fs");

mongoose
  .connect("mongodb+srv://yepezortizj:6weDwUQE8mkXlmHN@clustergreentech.nfril.mongodb.net/greentech?retryWrites=true&w=majority", {})
  .then(() => console.log("Conexión exitosa a MongoDB"))
  .catch((err) => console.log("Error al conectar a MongoDB", err));

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, "server.key")),
  cert: fs.readFileSync(path.join(__dirname, "server.cert")),
};

//listado de archivos de rutas
//Importacion de modelos
require("./model/sensor");
require("./model/datos_conf");
require("./model/usuario");
require("./model/riego");
require("./model/extraccion");
require("./model/iluminacion");

//importación de archivos de rutas
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var sensorRouter = require("./routes/sensores");
var datos_conf = require("./routes/conf");
var riegoRouter = require("./routes/riegos");
var extraccionRouter = require("./routes/extracciones");
var iluminacionRouter = require("./routes/iluminaciones");

//creacion de la aplicación Express
var app = express();

//Configuración del motor de plantillas
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//Middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(cors({
  origin: "*", // Permite cualquier origen (útil para desarrollo)
  methods: "GET, PUT, POST, DELETE, OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

//Configuración de rutas
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/sensores", sensorRouter);
app.use("/configuracion", datos_conf);
app.use("/riego", riegoRouter);
app.use("/extraccion", extraccionRouter);
app.use("/iluminacion", iluminacionRouter);

//catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

//error handler
app.use((err, req, res, next) => {
  console.error("Error detectado:", err.message);
  res.status(err.status || 500).json({ error: err.message });
});



// Crear servidor HTTPS
https.createServer(sslOptions, app).listen(443, () => {
  console.log("Servidor HTTPS en el puerto 443");
});

// Redirigir tráfico HTTP a HTTPS
https.createServer((req, res) => {
    res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
    res.end();
}).listen(80, () => {
    console.log("Redirección de HTTP a HTTPS en el puerto 80");
});

module.exports = app;
