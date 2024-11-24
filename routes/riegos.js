const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const Riego = require("../model/riego"); // Asegúrate de que la ruta sea correcta

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
router.post('/guardar-riego', async (req, res) => {
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
        const nuevaProgramacion = new Riego({ dias, hora });
        const resultado = await nuevaProgramacion.save();

        res.status(201).send({
            success: true,
            message: "Programación guardada con éxito.",
            data: resultado,
        });
    } catch (error) {
        console.error("Error al guardar programación:", error);
        res.status(500).send({ 
            success: false, 
            error: "Error al guardar la programación." 
        });
    }
});

router.get('/riegos', async (req, res) => {
    try {
      const riegos = await Riego.find({});
      res.status(200).send(riegos);
    } catch (error) {
      console.error('Error al obtener los riegos:', error);
      res.status(500).send({ error: 'Error al obtener los riegos' });
    }
  });

  router.get('/riegos-esp', async (req, res) => {
    try {
      const riegoMasReciente = await Riego.findOne({}).sort({ createdAt: +1 }); // Ordenar por fecha descendente
      if (!riegoMasReciente) {
        return res.status(404).send({ error: 'No hay registros de riegos' });
      }
      res.status(200).send(riegoMasReciente);
    } catch (error) {
      console.error('Error al obtener el riego más reciente:', error);
      res.status(500).send({ error: 'Error al obtener el riego más reciente' });
    }
  });
  
  

// Evento para manejar errores en el puerto serie
if (arduinoSerialPort) {
    arduinoSerialPort.on('error', (err) => {
        console.error("Error en el puerto serie:", err.message);
    });
}

module.exports = router;
