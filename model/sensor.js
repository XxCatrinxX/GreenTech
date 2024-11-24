const mongoose = require("mongoose");

const SensorSchema = new mongoose.Schema({
    temperatura: Number,
    humedadAmbiente: Number,
    humedadTierra: Number,
    fecha: String,
    hora: String,
});

module.exports = mongoose.model('Sensor', SensorSchema);
