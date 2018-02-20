var express = require('express');
var response = require('../response-helper');
var jwtVerify = require('../middlewares/auth').jwtVerify;

var app = express();
var Doctor = require('../models/doctor');


//==================================
// Obtener listado de doctores
//==================================
app.get('/', (req, res) => {

    var desde = req.query.desde;
    desde = isNaN(desde) ? 0 : Number(desde);

    var limit = req.query.limit;
    limit = isNaN(limit) ? 10 : Number(limit);

    var doctors = Doctor
        .find()
        .limit(limit)
        .skip(desde)
        .populate('user', 'name email')
        .populate('hospital')
        .exec((err, docs) => {
            if (err) {
                return response.error500(res, 'Error intentando obtener el listado de médicos', err);
            }

            Doctor.count({}, (err, total) => {
                return response.ok(res, ['doctors', 'total'], [docs, total]);
            });
        });
});


//==================================
// Crear doctor
//==================================
app.post('/', jwtVerify, (req, res) => {

    var body = req.body;

    var doctor = new Doctor({
        name: body.name,
        img: body.img,
        user: req.user._id,
        hospital: body.hospital
    });

    doctor.save((err, savedDoctor) => {
        if (err) {
            return response.error400(res, 'Error creando un médico', err);
        }

        return response.created(res, 'doctor', doctor);
    });
});


//==================================
// Actualizar médico
//==================================
app.put('/:id', jwtVerify, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Doctor.findById(id, (err, doctor) => {
        if (err) {
            return response.error500(res, 'Error actualizando el médico', err);
        }
        if (!doctor) {
            return response.error404(res,
                'Error al actualizar el médico', { message: 'No existe ningún médico con id ' + id });
        }

        doctor.name = body.name;
        doctor.img = body.img;
        doctor.user = req.user;
        doctor.hospital = body.hospital;

        doctor.save((err, savedDoctor) => {
            if (err) {
                return response.error400(res, 'Error actualizando el médico', err);
            }

            return response.ok(res, 'doctor', savedDoctor);
        });
    });
});


//==================================
// Eliminar médico
//==================================
app.delete('/:id', jwtVerify, (req, res) => {

    var id = req.params.id;

    Doctor.findByIdAndRemove(id, (err, doctor) => {
        if (err) {
            return response.error500(res, 'Error intentando eliminar el médico', err);
        }

        if (!doctor) {
            return response.error404(res,
                'Error al eliminar el médico', { message: 'No existe ningún médico con id ' + id }
            );
        }

        return response.ok(res, 'doctor', doctor);
    });
})

module.exports = app;