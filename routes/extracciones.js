const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const Extraccion = require("../model/extraccion"); // Asegúrate de que la ruta sea correcta

// Configuración del puerto serie para Arduino
const arduinoPort = "COM8"; // Cambiar según el puerto en que esté conectado el ESP32
let arduinoSerialPort;

// Intentar abrir el puerto serie y manejar errores
try {
    arduinoSerialPort = new SerialPort({ path: arduinoPort, baudRate: 9600 });
    const parser = arduinoSerialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));
    console.log(`Puerto serie ${arduinoPort} abierto correctamente.`);
} catch (err) {
    console.error("Error al abrir el puerto serie:", err.message);
}

// Ruta para guardar días seleccionados y la hora
router.post('/guardar-extraccion', async (req, res) => {
    try {
        const { dias, hora } = req.body;

        // Validar los datos recibidos
        if (!Array.isArray(dias) || dias.length === 0) {
            return res.status(400).send({ 
                success: false, 
                error: "Se deben proporcionar días válidos." 
            });
        }

        const horaRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
        if (!hora || !horaRegex.test(hora)) {
            return res.status(400).send({ 
                success: false, 
                error: "La hora debe estar en formato HH:mm." 
            });
        }

        // Crear un nuevo documento
        const nuevaProgramacion = new Extraccion({ dias, hora });
        const resultado = await nuevaProgramacion.save();

        res.status(201).send({
            success: true,
            message: "Extracción guardada con éxito.",
            data: resultado,
        });
    } catch (error) {
        console.error("Error al guardar extracción:", error);
        res.status(500).send({ 
            success: false, 
            error: "Error al guardar la extracción." 
        });
    }
});

router.get('/extracciones', async (req, res) => {
    try {
      const extracciones = await Extraccion.find({});
      res.status(200).send(extracciones);
    } catch (error) {
      console.error('Error al obtener las extracciones:', error);
      res.status(500).send({ error: 'Error al obtener las extracciones' });
    }
  });
  

// Evento para manejar errores en el puerto serie
if (arduinoSerialPort) {
    arduinoSerialPort.on('error', (err) => {
        console.error("Error en el puerto serie:", err.message);
    });
}

module.exports = router;
