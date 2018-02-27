var jwt = require('jsonwebtoken');
var SECRET = require('./config').config.secret;

module.exports = function jwtSign(user) {
    return jwt.sign({ user }, SECRET, { expiresIn: 14400 }); // 4 horas
}