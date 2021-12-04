const { Schema, model } = require('mongoose');
const flightSchema = new Schema({
    departure_date: {type : Date, required: true },
    departure_location: {type : String, required: true },
    arrival_date: {type : Date, required: true },
    arrival_location: {type : String, required: true },
    id: {type : Number, required: true }
}, { collection: 'flights' });
const Flight = model('Flight', flightSchema);
module.exports = Flight;