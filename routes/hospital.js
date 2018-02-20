var express = require('express');
var response = require('../response-helper');
var jwtVerify = require('../middlewares/auth').jwtVerify;

var app = express();

var Hospital = require('../models/hospital');

//==================================
// Obtener listado de hospitales
//==================================
app.get('/', (req, res) => {

    var desde = req.query.desde;
    desde = isNaN(desde) ? 0 : Number(desde);

    var limit = req.query.limit;
    limit = isNaN(limit) ? 10 : Number(limit);

    var hospitals = Hospital
        .find({})
        .skip(desde)
        .limit(limit)
        .populate('user', 'name email')
        .exec((err, hospitals) => {
            if (err) {
                return response.error500(res, "Error obteniendo el listado de hospitales", err);
            }

            Hospital.count({}, (err, total) => {
                return response.ok(res, ['hospitals', 'total'], [hospitals, total]);
            });
        });
});


//==================================
// Crear hospital
//==================================
app.post('/', jwtVerify, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        name: body.name,
        img: body.img,
        user: req.user._id
    });

    hospital.save((err, createdHospital) => {
        if (err) {
            return response.error500(res, 'Error intentando crear un hospital', err);
        }

        return response.created(res, 'hospital', createdHospital);
    });
});


//==================================
// Actualizar hospital
//==================================
app.put('/:id', jwtVerify, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    var hospital = new Hospital({
        name: body.name,
        img: body.img
    })

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return response.error500(res, 'Error al intentar actualizar el hospital', err);
        }

        if (!hospital) {
            return response.error404(res, 'Hopital no encontrado', { err: 'No existe ningún hospital con el id: ' + id });
        }

        hospital.name = body.name;
        hospital.img = body.img;
        hospital.user = req.user._id;

        hospital.save((err, updatedHospital) => {
            if (err) {
                return response.error400(res, 'Error actualizando el hospital', err);
            }

            return response.ok(res, 'hospital', updatedHospital);

        });
    });
});


//==================================
// Eliminar hospital
//==================================
app.delete('/:id', jwtVerify, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospital) => {
        if (err) {
            return response.error500(res, 'Error eliminando el hospital', err);
        }

        if (!hospital) {
            return response.error404(
                res,
                'Error eliminando el hospital', { err: 'No existe ningún hospital con id: ' + id }
            );
        }

        return response.ok(res, 'hospital', hospital);
    });
});


module.exports = app;