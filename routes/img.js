var express = require('express');
var response = require('../response-helper');
var fs = require('fs');
const uploadsPath = require('../common/config').Constants.uploadsPath;

var app = express();

app.get('/:tipo/:img', (req, res) => {

    var tipo = req.params.tipo;
    var filename = req.params.img;

    if (!tipo || !filename) {
        return response.error400('res', 'Tipo o nombre de archivo no válido', { message: 'Tipo o nombre de archivo no válido' });
    }

    var path = `${uploadsPath}/${tipo}/${filename}`;
    var defaultPath = `${uploadsPath}/default.jpg`;

    console.log('checking path: ' + path);
    var data;

    return (fs.existsSync(path) && !fs.statSync(path).isDirectory()) ?
        res.sendFile(path) :
        res.sendFile(defaultPath);
});

module.exports = app;