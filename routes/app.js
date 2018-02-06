var express = require('express');

var app = express();

app.get('/', (req, res) => {
    return res.json(req.token);
    res.status(200).json({
        ok: true,
        msg: "tutti e frutti"
    });
});

module.exports = app;