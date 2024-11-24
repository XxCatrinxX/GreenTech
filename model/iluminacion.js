const mongoose = require("mongoose");

const IluminacionSchema = new mongoose.Schema({
    brillo: Number,
});

module.exports = mongoose.model('Iluminacion', IluminacionSchema);
