// Requires
var express = require('express');
var mongoose = require('mongoose');

// // Inicialización de variables
var app = express();

// // Conexión a db
mongoose.connect('mongodb://localhost:2701/hospitalDB')
    .then(() => {
        console.log("\x1b[32mConnected to database\x1b[0m");
    })
    .catch((err) => {
        console.log('caspituuda');
        return -1;
    });

// Rutas
app.get('/', (req, res) => {
    res.status(200).json({
        ok: true,
        msg: "tutti e frutti"
    });
});

// Excuchar peticiones
app.listen(3000, () => {
    console.log('Listening on port 3000');
});