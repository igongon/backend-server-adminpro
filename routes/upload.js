var express = require('express');
var response = require('../response-helper');
var fs = require('fs');
var mongoose = require('mongoose');
var fileUpload = require('express-fileupload');
var jwtVerify = require('../middlewares/auth').jwtVerify;
var app = express();

var User = require('../models/user');
var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');

const uploadsPath = require('../common/config').Constants.uploadsPath;


// default options
app.use(fileUpload());

app.put('/:tipo/:id', jwtVerify, function(req, res) {
    if (!req.files) {
        return response.error400(res, 'No se ha encontrado ningún archivo', { message: 'No file found' });
    }

    // The name of the input field (i.e. "imagen") is used to retrieve the uploaded file
    var file = req.files.imagen;
    var secciones = file.name.split('.');
    var extension = secciones[secciones.length - 1];
    var validExt = ['jpg', 'bmp', 'png', 'jpeg', 'gif'];
    var tipo = req.params.tipo;
    var id = req.params.id;
    var destinationDir = `${uploadsPath}/${tipo}`;

    if (validExt.indexOf(extension) < 0) {
        return response.error400(res, 'Extensión no válida', { message: 'Extensión no válida: ' + extension });
    }
    console.log('checking path: ' + destinationDir);

    // Use the mv() method to place the file somewhere on your server
    if (fs.existsSync(destinationDir)) {
        var path = `${destinationDir}/${id}-${new Date().getMilliseconds()}.${extension}`;

        file.mv(path, function(err) {
            if (err)
                return response.error500(res, 'Error al mover archivo', err);

            uploadByTipo(res, tipo, id, path);
        });
    } else {
        return response.error400(res, 'Tipo de colección no válido: ' + tipo, { message: 'El tipo de colección no existe: ' + tipo })
    }
});


function uploadByTipo(res, tipo, id, path) {
    switch (tipo) {
        case 'user':
            uploadModel(res, tipo, User, id, path);
            break;

        case 'doctor':
            uploadModel(res, tipo, Doctor, id, path);
            break;

        case 'hospital':
            uploadModel(res, tipo, Hospital, id, path);
            break;

        default:
            return response.error400(res, 'El tipo no es válido: ' + tipo, { message: 'Tipo no válido' });
    }
}

function uploadModel(res, modelName, model, id, path) {
    model.findById(id, (err, item) => {

        if (err) {
            return response.error400(res, 'Error intentando buscar el elemento', err)
        }

        if (!item) {
            return response.error404(res, `Registro de tipo ${modelName} no encontrado con id ${id}`, { mesage: `Registro de tipo ${modelName} no encontrado con id ${id}` });
        }

        var oldpath = `${uploadsPath}/${modelName}/${item.img}`;

        console.log('Comprobando si existe la ruta.');
        if (item.img && fs.existsSync(oldpath)) {
            console.log('Eliminando imagen: ' + oldpath);
            fs.unlinkSync(oldpath);
        }

        var secciones = path.split('/');
        var filename = secciones[secciones.length - 1];

        item.img = filename;

        item.save((err, savedItem) => {
            if (err) {
                return response.error500(res, 'Error actualizando la imagen en la bbdd', err);
            }

            if (savedItem.password) {
                savedItem.password = ':)';
            }

            return response.ok(res, modelName, item);
        });
    });
}



module.exports = app;