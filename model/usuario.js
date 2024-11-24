const mongoose = require("mongoose");

const UsuarioSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

mongoose.model('Usuario', UsuarioSchema);