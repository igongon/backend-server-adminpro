var express = require('express');
var response = require('../response-helper');

var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');
var User = require('../models/user');

var app = express();


//==================================
// Buscar todo
//==================================
app.get('/all/:query', (req, res) => {

    var query = req.params.query;
    var regex = new RegExp(query, 'i');

    var users, hospital, doctors;

    Promise.all([
            findHospital(regex),
            findDoctor(regex),
            findUser(regex)
        ])
        .then(values => {
            return response.ok(
                res, ['hospitals', 'doctors', 'users'], [values[0], values[1], values[2]]);
        })
        .catch(error => response.error500(res, 'Error en la búsqueda', err));
});


//==================================
// Buscar hospitales
//==================================
app.get('/hospitals/:query', (req, res) => {

    var query = req.params.query;
    var regex = new RegExp(query, 'i');

    findHospital(regex)
        .then(hospitals => response.ok(res, 'hospitals', hospitals))
        .catch(error => response.error500(res, 'Error en la búsqueda', err));

});


//==================================
// Buscar médicos
//==================================
app.get('/doctors/:query', (req, res) => {

    var query = req.params.query;
    var regex = new RegExp(query, 'i');

    findDoctor(regex)
        .then(result => response.ok(res, 'doctors', result))
        .catch(error => response.error500(res, 'Error en la búsqueda', err));

});

//==================================
// Buscar usuarios
//==================================
app.get('/users/:query', (req, res) => {

    var query = req.params.query;
    var regex = new RegExp(query, 'i');

    findDoctor(regex)
        .then(result => response.ok(res, 'doctors', result))
        .catch(error => response.error500(res, 'Error en la búsqueda', err));

});

//==================================
// Búsqueda por colección
//==================================
app.get('/collection/:colect/:query', (req, res) => {

    var collection = req.params.colect;
    var query = req.params.query;
    var regex = new RegExp(query, 'i');
    var promise;

    switch (collection) {
        case 'users':
            promise = findUser(regex);
            break;

        case 'doctors':
            promise = findDoctor(regex);
            break;

        case 'hospitals':
            promise = findHospital(regex);
            break;

        default:
            return response.error400(res, 'No existe la colección: ' + collection, { message: 'No existe la colección: ' + collection })
    }

    promise.then(result => response.ok(res, collection, result))
        .catch(error => response.error500(res, 'Error en la búsqueda', error));
});



function findHospital(regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ name: regex }, (err, result) => {
            if (err) {
                reject('Error al buscar hospitales. Expresión:' + regex, err);
            }

            resolve(result);
        });
    });
}

function findDoctor(regex) {
    return new Promise((resolve, reject) => {
        Doctor.find({ name: regex }, (err, result) => {
            if (err) {
                reject('Error al buscar médicos. Expresión:' + regex, err);
            }

            resolve(result);
        });
    });
}

function findUser(regex) {
    return new Promise((resolve, reject) => {
        User.find({}, 'name email img')
            .or([{ name: regex }, { email: regex }])
            .exec((err, result) => {
                if (err) {
                    reject('Error al buscar usuarios. Expresión:' + regex, err);
                }

                resolve(result);
            });
    });
}

module.exports = app;