const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const Iluminacion = require("../model/iluminacion"); // Asegúrate de que la ruta sea correcta

// Configuración del puerto serie para Arduino
const arduinoPort = "COM8"; // Cambiar según el puerto en que esté conectado el ESP32
let arduinoSerialPort;

// Intentar abrir el puerto serie y manejar errores
try {
  arduinoSerialPort = new SerialPort({ path: arduinoPort, baudRate: 9600 });
  const parser = arduinoSerialPort.pipe(
    new ReadlineParser({ delimiter: "\r\n" })
  );
  console.log(`Puerto serie ${arduinoPort} abierto correctamente.`);
} catch (err) {
  console.error("Error al abrir el puerto serie:", err.message);
}



router.post("/", async (req, res) => {
  try {
    const { brillo } = req.body;

    if (typeof brillo !== 'number') {
      return res.status(400).json({ error: 'El brillo debe ser un número válido' });
    }

    console.log('Brillo recibido en el servidor:', brillo);

    // Inserta el dato en la base de datos
    const nuevaIluminacion = new Iluminacion({ brillo });
    await nuevaIluminacion.save();

    res.status(201).json({
      message: 'Brillo recibido y guardado con éxito',
      data: nuevaIluminacion,
    });
  } catch (error) {
    console.error('Error al guardar el brillo:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});



  
// Evento para manejar errores en el puerto serie
if (arduinoSerialPort) {
  arduinoSerialPort.on("error", (err) => {
    console.error("Error en el puerto serie:", err.message);
  });
}

module.exports = router;
