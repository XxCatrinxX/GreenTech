var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");

const mongoose = require("mongoose");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const Usuario = mongoose.model("Usuario");
const arduinoPort = "COM8";
const arduinoSerialPort = new SerialPort({ path: arduinoPort, baudRate: 9600 });
const parser = arduinoSerialPort.pipe( new ReadlineParser({ delimiter: "\r\n" }));

let username = "";

// Rutas del método HTTPS
router.get("/", async (req, res) => {
  parser.on("data", function (data, err) {
    if (err) {
      return console.log(err);
    }
    console.log("valor:" + data);
    username = data.toString("utf8");
  });

  res.send({ username });
});

router.get("/reanudar", async (req, res) => {
  arduinoSerialPort.resume();
  res.send({ username });
});

router.get("/detener", async (req, res) => {
  arduinoSerialPort.pause();

  detenido = {
    msg: "cerrar",
  };
  res.send({ detenido });
});

//Ruta para crear un nuevo usuario
router.post('/', async (req, res) => {
  try {
    // Generar un hash para la contraseña
    const saltRounds = 10; // Nivel de seguridad (número de rondas de hash)
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // Crear el usuario con la contraseña encriptada
    const usuario = new Usuario({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    // Guardar en la base de datos
    await usuario.save();

    // Enviar respuesta (sin incluir la contraseña en la respuesta)
    res.status(201).send({
      id: usuario._id,
      username: usuario.username,
      email: usuario.email,
    });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).send({ message: 'Error al crear el usuario' });
  }
});

//Ruta para el inicio de sesion
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validación inicial de datos enviados
  if (!username || !password) {
    return res.status(400).json({ message: 'Se requieren nombre de usuario y contraseña' });
  }

  try {
    // Buscar al usuario en la base de datos por nombre de usuario o correo electrónico
    const user = await Usuario.findOne({ username });

    // Si el usuario no existe, retornar error
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Comparar la contraseña proporcionada con la almacenada
    const isMatch = await bcrypt.compare(password, user.password);

    // Si la contraseña no coincide, retornar error
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Si todo está correcto, enviar respuesta con información relevante del usuario
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error en la autenticación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
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
  username = data.toString("utf8");

  /* if(username =="Abierto"){
         puerta = false;
         var distancia = new Sensor({
             fecha: new Date(),
             hora: new Date().getTime(),
             distancia: username,
             lectura: req.body.lectura
         });
         await distancia.save();
     }
     else if(username == "cerrado"){
         puerta = true;
         var distancia = new Sensor({
             fecha: new Date(),
             hora: new Date().getTime(),
             distancia: username,
             lectura: req.body.lectura
         });
         await distancia.save();
     }

     if(puerta == true && username == "intruso detectado"){
         var distancia = new Sensor({
             fecha: new Date(),
             hora: new Date().getTime(),
             distancia: username,
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
