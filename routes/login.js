var express = require('express');
var bcrypt = require('bcryptjs');
var response = require('../response-helper');
var config = require('../common/config');
var jwtSign = require('../common/jwtHelper');

var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;

var SECRET = config.secret;
var CLIENT_ID = config.googleClientId;

var app = express();
var User = require('../models/user');


//==================================
// Login normal
//==================================
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
            var token = jwtSign(user);

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



//==================================
// Google login
//==================================
app.post('/google', (req, res) => {

    var token = req.body.token || 'XXX';

    var client = new auth.OAuth2(CLIENT_ID, SECRET, '');

    client.verifyIdToken(
        token,
        CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
        function(e, login) {
            if (e)
                return response.error400(res, 'errors', e);

            var payload = login.getPayload();
            var userid = payload.sub;
            // If request specified a G Suite domain:
            //var domain = payload['hd'];

            User.findOne({ email: payload.email }, (err, usuario) => {

                if (err) {
                    return response.error500(res, 'errors', err);
                }

                if (usuario) {

                    if (usuario.google === false) {
                        return res.status(400).json({
                            ok: true,
                            mensaje: 'Debe de usar su autenticación normal'
                        });
                    } else {

                        usuario.password = ':)';

                        var token = jwtSign(usuario);

                        res.status(200).json({
                            ok: true,
                            user: usuario,
                            token: token,
                            id: usuario._id,
                            menu: obtenerMenu(usuario.role)
                        });

                    }

                    // Si el usuario no existe por correo
                } else {

                    var usuario = new User();

                    usuario.name = payload.name;
                    usuario.email = payload.email;
                    usuario.password = ':)';
                    usuario.img = payload.picture;
                    usuario.google = true;

                    usuario.save((err, usuarioDB) => {

                        if (err) {
                            return res.status(500).json({
                                ok: true,
                                mensaje: 'Error al crear usuario - google',
                                errors: err
                            });
                        }


                        var token = jwtSign(usuarioDB);

                        res.status(200).json({
                            ok: true,
                            user: usuarioDB,
                            token: token,
                            id: usuarioDB._id,
                            menu: obtenerMenu(usuarioDB.role)
                        });

                    });

                }
            });
        });
});



function obtenerMenu(ROLE) {

    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Gráficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'RxJs', url: '/rxjs' }
            ]
        },
        {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                // { titulo: 'Usuarios', url: '/usuarios' },
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Médicos', url: '/medicos' }
            ]
        }
    ];

    console.log('ROLE', ROLE);

    if (ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }


    return menu;

}




module.exports = app;