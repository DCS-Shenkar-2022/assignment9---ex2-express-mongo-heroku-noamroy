const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    id: { type : Number, required: true },
    firstName : { type : String, required: true },
    lastName: { type : String }
}, { collection: 'users' });

const User = model('USER', userSchema);
module.exports = User;