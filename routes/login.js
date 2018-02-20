var express = require('express');
var bcrypt = require('bcryptjs');
var response = require('../response-helper');
var jwt = require('jsonwebtoken');
var SECRET = require('../common/config').SECRET;

var app = express();
var User = require('../models/user');


app.post('/', (req, res) => {

    var email = req.body.email;
    var pass = req.body.password;

    if (!email || !pass)
        return response.error400(res, 'Email y/o password vacíos');

    User.findOne({ email }, (err, user) => {
        if (err) {
            return response.error500(res, 'Error intentando autenticar el usuario', err);
        }

        if (!user) {
            return response.error400(res, 'Falló la autenticación', { message: 'No existe ninguna cuenta con el email indicado' });
        }

        if (bcrypt.compareSync(pass, user.password)) {
            // No es deseable enviar el password en el token
            user.password = '';

            // JWT
            var token = jwt.sign({ user }, SECRET, { expiresIn: 14400 }); // 4 horas

            return res.status(200).json({
                ok: true,
                user,
                token,
                id: user._id
            })
        } else
            return response.error401(res, 'Falló la autenticación', { message: 'Password incorrecto' });
    })
});


module.exports = app;