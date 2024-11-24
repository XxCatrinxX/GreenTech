const mongoose = require("mongoose");

const ExtraccionSchema = new mongoose.Schema({
    dias: [String], // Almacena una lista de días seleccionados
    hora: String,   // Almacena la hora programada
});

module.exports = mongoose.model('Extraccion', ExtraccionSchema);