var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var doctorSchema = new Schema({
    name: { type: String, required: [true, 'El campo nombre es requerido '] },
    img: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: [true, 'Es necesario asignar un hospital al médico'] }
})

module.exports = mongoose.model('Doctor', doctorSchema);