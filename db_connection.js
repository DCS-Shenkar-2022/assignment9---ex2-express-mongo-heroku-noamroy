console.log (`got here 1.1`);
const mongoose = require('mongoose');
const consts = require('./constants');
const { DB_HOST, DB_USER, DB_PASS } = consts;
const url = DB_HOST;
console.log (`got here 1.2`);
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    user: DB_USER,
    pass: DB_PASS
};
console.log (consts);
mongoose
    .connect (url, options)
    .then(() => console.log('connect to DB'))
    .catch(err => console.log(`connection error: ${err}`));