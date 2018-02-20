var jwt = require('jsonwebtoken');
var SECRET = require('../common/config').SECRET;
var response = require('../response-helper');

exports.getAccessToken = function(req, res, next) {
    var token, error;

    if (req.headers && req.headers.authorization) {
        parts = req.headers.authorization.split(' ');

        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }

    if (req.body && req.body.access_token) {
        if (token) {
            error = true;
        }
        token = req.body.access_token;
    }

    if (req.query && req.query.access_token) {
        if (token) {
            error = true;
        }
        token = req.query.access_token;
    }

    if (error) {
        res.status(400).send();
    } else {
        req.token = token;
        next();
    }
};

exports.jwtVerify = function(req, res, next) {

    var token = req.token;

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) {
            return response.error401(res, 'Invalid token', err);
        }
        req.user = decoded.user;

        next();
    });
};