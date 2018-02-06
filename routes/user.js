var express = require('express');
var response = require('../response-helper');
var bcrypt = require('bcryptjs');
var jwtVerify = require('../middlewares/auth').jwtVerify;

var app = express();

var User = require('../models/user');


//==================================
// Obtener todos los usuarios
//==================================
app.get('/', (req, res) => {

    User.find({}, 'name email img role')
        .exec((err, users) => {

            if (err)
                response.error500(res, 'Error al intentar obtener los usuarios', err);

            response.ok(res, 'users', users);
        });
});


//==================================
// Crear nuevo usuario
//==================================
app.post('/', jwtVerify, (req, res) => {

    var body = req.body;

    var user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    user.save((err, savedUser) => {
        if (err)
            return response.error400(res, 'Error creando usuario', err);

        return response.created(res, 'user', savedUser);
    });
});


//==================================
// Actualizar usuario
//==================================
app.put('/:id', jwtVerify, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    User.findById(id, (err, user) => {
        if (err)
            return response.error500(res, 'Error al actualizar el usuario', err);

        if (!user) {
            return response.error400(
                res,
                'Error al actualizar el usuario', { message: 'No existe ningún usuario con id ' + id }
            );
        }

        user.name = body.name;
        user.email = body.email;
        user.img = body.img;
        user.role = body.role;

        user.save((err, savedUser) => {
            if (err) {
                return response.error400(res, 'Error al actualizar el usuario', err);
            }

            return response.ok(res, 'user', savedUser);
        });
    });
});


//==================================
// Eliminar usuario
//==================================
app.delete('/:id', jwtVerify, (req, res) => {
    var id = req.params.id;

    User.findByIdAndRemove(id, (err, deletedUser) => {
        if (err)
            return response.error500(res, 'Error al eliminar el usuario', err);

        if (!deletedUser) {
            return response.error400(
                res,
                'Error al eliminar el usuario', { message: 'No existe ningun usuario con id ' + id }
            );
        }

        return response.ok(res, 'user', deletedUser);
    });
});

module.exports = app;