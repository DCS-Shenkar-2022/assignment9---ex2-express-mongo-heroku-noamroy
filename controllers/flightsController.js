//const { json } = require('express');
const winston_lib = require('winston');
const Flight = require('../models/flight');
var axios = require("axios").default;
const logger = winston_lib.createLogger({
    level: 'debug',
    format: winston_lib.format.simple(),
    transports: [
        new winston_lib.transports.File({ filename: 'logs.txt' }),
        new winston_lib.transports.Console()
    ]
});
exports.flightsController = {
    async getAllFlights(req, res) {
        logger.info(`REQ: Get all flights`);
        const answer = await Flight.find()
            .catch(err => logger.info(`Error getting the data from db: ${err}`));
        if (answer.length!=0){
            logger.info(`RES: get all flights`);
            res.json(answer);
        }
        else{
            logger.info(`RES: NO FLIGHTS IN DB!`);
            res.status(404).send(`RES: NO FLIGHTS IN DB!`); 
        }
    },
    async getSpecificFlight(req, res) {
        const _id = req.path.substring(1)
        logger.info(`REQ: Get specific flight number ${_id}`);
        if (isNaN(_id)){
            logger.info(`RES: input is nan error "${_id}"`);
            res.status(400).send(`input is nan error "${_id}"!`); 
        }
        else{
            var jsonAnswer = { status: "success", flight: {}, weatherOnArrival: {} };
            var flightData = await Flight.find({ id: Number(_id)})
            .catch(err => logger.info(`Error getting the data from db: ${err}`));
            logger.info(flightData);
            if (flightData.length!=0){
                flightData = flightData[0];
                jsonAnswer.flight=flightData;
                const weatherRequest = {
                    Method: 'GET',
                    url: 'https://community-open-weather-map.p.rapidapi.com/climate/month?',
                    params: { q: (flightData.arrival_location), units: 'metric'},
                    headers: {
                        'x-rapidapi-host': 'community-open-weather-map.p.rapidapi.com',
                        'x-rapidapi-key': '0f9cb8c6e8msh9c5562e4a9ac404p160bb8jsn80fd719f356e'
                    }
                };
                const currentdate = new Date();
                const Difference_In_Time = flightData.arrival_date.getTime() - currentdate.getTime();
                const Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24));
                logger.info(`DAYS: ${Difference_In_Days}`);
                if (Difference_In_Days<=30){
                    await axios.request(weatherRequest).then(function (weatherResponse) {
                        var weatherData = weatherResponse.data;
                        weatherData=(weatherData.list)[Difference_In_Days];
                        jsonAnswer.weatherOnArrival=weatherData;
                        logger.info(JSON.stringify(weatherData));
                    }).catch(function (error) {
                        logger.info(`ERROR- GETTING WEATHER- ${error}`);
                        jsonAnswer.weatherOnArrival = "ERROR- GETTING WEATHER";
                    });
                }
                else{
                    logger.info(`GETTING WEATHER NO DATA AVALIBLE- more than 30 days before arrival`);
                    jsonAnswer.weatherOnArrival = "NO DATA AVALIBLE- more than 30 days before arrival";
                }
                logger.info(JSON.stringify(jsonAnswer));
                logger.info(`RES: get flight data number: ${_id}`);
                res.json(jsonAnswer);
            }
            else{
                logger.info(`RES: Didn't find flight number: ${_id}!`);
                res.status(404).send(`RES: Didn't find flight number: ${_id}!`); 
            }
        }
    },
    async createFlight(req, res) {
        logger.info(`REQ: POST add an flight`);
        let body = req.body;
        let _id = await Flight.find();
        _id = _id[(_id.length)-1].id+1;
        if (body.departure_date &&
            body.departure_location &&
            body.arrival_date &&
            body.arrival_location &&
            _id){
                const newFlight = new Flight({
                    "departure_date": body.departure_date,
                    "departure_location": body.departure_location,
                    "arrival_date": body.arrival_date,
                    "arrival_location": body.arrival_location,
                    "id": _id
                });
                const result = newFlight.save();
                if (result) {
                    logger.info(`RES: add flight number ${newFlight.id}`);
                    res.json(result);
                } else {
                    res.status(404).send("Error saving a flight");''
                }
        } else {
            logger.info(`RES: INPUT ERROR`);
            res.status(400).send(`INPUT ERROR!`); 
        }
    },
    async updateFlight(req, res) {
        const _id = req.path.substring(1);
        logger.info(`REQ: update an flight number: ${_id}`);
        if (isNaN(_id)){
            logger.info(`RES: input is nan error "${_id}"`);
            res.status(400).send(`input is nan error "${_id}"!`); 
        }
        else {
            let body = req.body;
            let newFlight = await Flight.find({ id: Number(_id)})
                .catch(err => logger.info(`Error getting the data from db: ${err}`));
            if (newFlight.length == 0){
                logger.info(`RES: Didn't find flight number: ${_id}!`);
                res.status(404).send(`RES: Didn't find flight number: ${_id}!`); 
            }
            else {
                if (body.departure_date)
                    newFlight.departure_date=body.departure_date;
                if (body.departure_location)
                    newFlight.departure_location=body.departure_location;
                if (body.arrival_date)
                    newFlight.arrival_date=body.arrival_date;
                if (body.arrival_location)
                    newFlight.arrival_location=body.arrival_location;
                Flight.updateOne({ id: _id }, {
                    departure_date: newFlight.departure_date,
                    departure_location: newFlight.departure_location,
                    arrival_date: newFlight.arrival_date,
                    arrival_location: newFlight.arrival_location})
                    .then(docs => {res.json(docs) })
                    .catch(err => logger.info(`Error update one flight from db: ${err}`));
            }
        }
    },
    async deleteFlight(req, res) {
        const _id = req.path.substring(1);
        logger.info(`REQ: delete specific flight number ${_id}`);
        if (isNaN(_id)){
            logger.info(`RES: input is nan error "${_id}"`);
            res.status(400).send(`input is nan error "${_id}"!`); 
        }
        else{
            const answer = await Flight.find({ id: Number(_id)})
            .catch(err => logger.info(`Error getting the data from db: ${err}`));
            console.log("GOT HERE");
            if (answer.length!=0){
                logger.info(`RES: delete flight number: ${_id}`);
                Flight.deleteOne ({ id: Number(_id)})
                .then(docs => { res.json(docs)})
                .catch(err => logger.info(`Error deleting flight from db: ${err}`));
            }
            else{
                logger.info(`RES: Didn't find flight number: ${_id}!`);
                res.status(404).send(`RES: Didn't find flight number: ${_id}!`); 
            }
        }
    }
};
