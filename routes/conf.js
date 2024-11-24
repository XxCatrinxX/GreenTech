var express = require("express");
var router = express.Router();
const Config = require("../model/datos_conf");

const mongoose = require("mongoose");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const Datos = mongoose.model("Config");
const arduinoPort = "COM8";
const arduinoSerialPort = new SerialPort({ path: arduinoPort, baudRate: 9600 });
const parser = arduinoSerialPort.pipe(
  new ReadlineParser({ delimiter: "\r\n" })
);

let datos = "";

// Rutas del método HTTPS
router.get("/", async (req, res) => {
  parser.on("data", function (data, err) {
    if (err) {
      return console.log(err);
    }
    console.log("valor:" + data);
    datos = data.toString("utf8");
  });

  res.send({ datos });
});

router.get("/reanudar", async (req, res) => {
  arduinoSerialPort.resume();
  res.send({ datos });
});

router.get("/detener", async (req, res) => {
  arduinoSerialPort.pause();

  detenido = {
    msg: "cerrar",
  };
  res.send({ detenido });
});

router.post("/", async (req, res) => {
  var lecturadatos = new Datos({
    temperatura: req.body.temperatura,
    humedad_am: req.body.humedad_am,
    humedad_ti: req.body.humedad_ti,
  });
  await lecturadatos.save();
  res.status(201).send(lecturadatos);
});

// Ruta para obtener todos los documentos de la colección "Config"
// Código Express para enviar los datos
router.get("/datos", async (req, res) => {
  try {
    const datoReciente = await Config.find().sort({ _id: -1 }).limit(1);
    if (datoReciente.length > 0) {
      const { temperatura, humedad_am, humedad_ti } = datoReciente[0];
      res.json({ temperatura, humedad_am, humedad_ti });
    } else {
      res.status(404).json({ message: "No se encontraron datos" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error al obtener los datos", error: err });
  }
});


// Apertura del puerto COM8

arduinoSerialPort.on("open", function (err) {
  if (err) {
    return console.log(err);
  }
  console.log("Exito en apertura");
});

let puerta = true; // Esto significa puerta física cerrada
parser.on("data", async function (data, err) {
  if (err) {
    return console.log(err);
  }
  console.log("valor:" + data);
  datos = data.toString("utf8");

  /* if(datos =="Abierto"){
         puerta = false;
         var distancia = new Sensor({
             fecha: new Date(),
             hora: new Date().getTime(),
             distancia: datos,
             lectura: req.body.lectura
         });
         await distancia.save();
     }
     else if(datos == "cerrado"){
         puerta = true;
         var distancia = new Sensor({
             fecha: new Date(),
             hora: new Date().getTime(),
             distancia: datos,
             lectura: req.body.lectura
         });
         await distancia.save();
     }

     if(puerta == true && datos == "intruso detectado"){
         var distancia = new Sensor({
             fecha: new Date(),
             hora: new Date().getTime(),
             distancia: datos,
             lectura: req.body.lectura
         });
         await distancia.save();
     }*/
});

arduinoSerialPort.on("error", function (err) {
  if (err) {
    return console.log(err);
  }
});

module.exports = router;
