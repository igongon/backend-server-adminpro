// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser'); // transforma los parametros de un form en un objeto js
var getAccessToken = require('./middlewares/auth').getAccessToken;


// // Inicialización de variables
var app = express();

///// body-parser /////
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
    ///// Fin body-parser //////


// Asignar token al objeto request
app.use(getAccessToken);



// Importación de rutas
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginRoutes = require('./routes/login');



// // Conexión a db
mongoose.connect('mongodb://localhost:27017/hospitalDB')
    .then(() => {
        console.log("\x1b[32mConnected to database\x1b[0m");
    })
    .catch((err) => {
        console.error('Error al conectar a la bbdd', err);
        return -1;
    });



// Rutas
app.use('/user', userRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);




// Excuchar peticiones
app.listen(3000, () => {
    console.log('Listening on port 3000');
});