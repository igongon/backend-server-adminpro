var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var validRoles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un nombre de rol permitido'
};

var userSchema = new mongoose.Schema({

    name: { type: 'String', required: [true, 'El nombre es obligatorio'] },
    email: { type: 'String', unique: true, required: [true, 'El email es obligatorio'] },
    password: { type: 'String', required: [true, 'El password es obligatorio'] },
    img: { type: 'String', required: false },
    role: { type: 'String', required: true, default: 'USER_ROLE', enum: validRoles }
});

userSchema.plugin(uniqueValidator, { message: 'El campo {PATH} debe de ser único ' });

module.exports = mongoose.model('User', userSchema);