const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const Sensor = mongoose.model('Sensor');

// Configuración del puerto serie para Arduino
const arduinoPort = "COM8"; // Cambiar según el puerto en que esté conectado el ESP32
const arduinoSerialPort = new SerialPort({ path: arduinoPort, baudRate: 9600 });
const parser = arduinoSerialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Variable para almacenar la última lectura de temperatura
let temperatura = "";

// Rutas HTTP
router.get('/', (req, res) => {
    res.send({ temperatura });
});

router.get('/reanudar', (req, res) => {
    arduinoSerialPort.resume();
    res.send({ mensaje: "Conexión reanudada" });
});

router.get('/detener', (req, res) => {
    arduinoSerialPort.pause();
    res.send({ mensaje: "Conexión pausada" });
});

router.get('/datos', async (req, res) => {
    try {
        const datosSensores = await Sensor.find();
        res.json(datosSensores);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener datos de sensores" });
    }
});

// Nueva ruta POST para insertar datos
router.post('/insertar', async (req, res) => {
    try {
        const { temperatura, humedad_am, humedad_ti } = req.body;

        // Renombrar variables para adaptarlas al modelo
        const humedadAmbiente = humedad_am;
        const humedadTierra = humedad_ti;

        // Validar que los datos requeridos estén presentes
        if (temperatura === undefined || humedadAmbiente === undefined || humedadTierra === undefined) {
            console.error("Datos incompletos recibidos:", req.body);
            return res.status(400).json({ error: "Todos los campos son requeridos" });
        }

        // Mostrar datos recibidos en consola
        console.log("Datos recibidos desde el ESP32:");
        console.log(`Temperatura: ${temperatura}, Humedad Ambiente: ${humedadAmbiente}, Humedad Tierra: ${humedadTierra}`);

        // Crear un nuevo documento con la lectura
        const nuevaLectura = new Sensor({
            fecha: new Date().toLocaleDateString(),
            hora: new Date().toLocaleTimeString(),
            temperatura,
            humedadAmbiente,
            humedadTierra
        });

        // Guardar en la base de datos
        await nuevaLectura.save();

        // Mostrar datos guardados en consola
        console.log("Datos guardados en la base de datos:", nuevaLectura);

        res.status(201).json({ mensaje: "Datos guardados con éxito", data: nuevaLectura });
    } catch (error) {
        console.error("Error al guardar datos en la base de datos:", error);
        res.status(500).json({ error: "Error al guardar datos" });
    }
});



// Apertura del puerto COM8
arduinoSerialPort.on('open', () => {
    console.log("Puerto serie abierto con éxito");
});

// Leer datos del puerto serie y guardar en la base de datos
parser.on('data', async (data) => {
    try {
        console.log("Lectura desde puerto serie:", data);
        const sensorData = JSON.parse(data.toString('utf8'));

        const nuevaLectura = new Sensor({
            fecha: new Date().toLocaleDateString(),
            hora: new Date().toLocaleTimeString(),
            temperatura: sensorData.temperatura,
            humedadAmbiente: sensorData.humedad_aire,
            humedadTierra: sensorData.humedad_suelo
        });

        await nuevaLectura.save();
        console.log("Datos guardados en la base de datos:", nuevaLectura);
    } catch (error) {
        console.error("Error al guardar datos en la base de datos:", error);
    }
});

arduinoSerialPort.on('error', (err) => {
    console.log("Error en el puerto serie:", err);
});

module.exports = router;
