const mongoose = require("mongoose");

const DatosConfSchema = mongoose.Schema({
    temperatura: Number,
    humedad_am: Number,
    humedad_ti: Number,
});

module.exports = mongoose.model("Config", DatosConfSchema);
