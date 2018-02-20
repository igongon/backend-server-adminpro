var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var hospitalSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es necesario'], unique: true },
    img: String,
    user: { type: Schema.Types.ObjectId, ref: 'User' }
});

hospitalSchema.plugin(uniqueValidator, { message: 'El campo {PATH} debe de ser único' });

module.exports = mongoose.model('Hospital', hospitalSchema);