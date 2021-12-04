//~~~~~~~~~INCLUDES~~~~~~~~~~~~
const Flight = require('../models/flight');
var axios = require("axios").default;
//~~~~~~~~LOGGER SET UP~~~~~~~~
const winston_lib = require('winston');
const logger = winston_lib.createLogger({
    level: 'debug',
    format: winston_lib.format.simple(),
    transports: [
        new winston_lib.transports.File({ filename: 'logs.txt' }),
        new winston_lib.transports.Console()
    ]
});
//~~~~~~~EXPORTED FUNCTIONS~~~~~~~~~~
exports.flightsController = {
    async getAllFlights(req, res) {
        logger.info(`REQ: Get all flights`);
        const answer = await Flight.find()
            .catch(err => {
                logger.info(`Error getting the data from db: ${err}`);
                res.status(500).json({status: 500 , msg: `Server error`});
            });
        if (answer.length!=0){
            logger.info(`RES: get all flights`);
            res.json(answer);
        }
        else{
            logger.info(`RES: NO FLIGHTS IN DB!`);
            res.status(404).json({status: 404 , msg: `NO FLIGHTS IN DB!`});
        }
    },
    async getSpecificFlight(req, res) {
        const flight_id = req.path.substring(1)
        logger.info(`REQ: Get specific flight number ${flight_id}`);
        if (isNaN(flight_id)){
            logger.info(`RES: input is nan error "${flight_id}"`);
            res.status(400).json({status: 400 , msg: `input is nan error "${flight_id}"!`});
        }
        else{
            var jsonAnswer = { status: "success", flight: {}, weatherOnArrival: {} };
            var flightData = await Flight.find({ id: Number(flight_id)})
                .catch(err => {
                    logger.info(`Error getting the data from db: ${err}`);
                    res.status(500).json({status: 500 , msg: `Server error`});
                });
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
                if (Difference_In_Days<=30){
                    await axios.request(weatherRequest).then(function (weatherResponse) {
                        var weatherData = weatherResponse.data;
                        weatherData=(weatherData.list)[Difference_In_Days];
                        jsonAnswer.weatherOnArrival=weatherData;
                    }).catch(function (error) {
                        logger.info(`ERROR- GETTING WEATHER- ${error}`);
                        jsonAnswer.weatherOnArrival = "ERROR- GETTING WEATHER";
                    });
                }
                else{
                    logger.info(`GETTING WEATHER-NO DATA AVALIBLE- more than 30 days before arrival`);
                    jsonAnswer.weatherOnArrival = "NO DATA AVALIBLE- more than 30 days before arrival";
                }
                logger.info(`RES: get flight data number: ${flight_id}`);
                res.json(jsonAnswer);
            }
            else{
                logger.info(`RES: Didn't find flight number: ${flight_id}!`);
                res.status(404).json({status: 404 , msg: `Didn't find flight number: ${flight_id}!`});
            }
        }
    },
    async createFlight(req, res) {
        logger.info(`REQ: POST add an flight`);
        let body = req.body;
        let flight_id = await Flight.find();
        if (flight_id.length!=0)
            flight_id = flight_id[(flight_id.length)-1].id+1;
        else
            flight_id=1;
        if (body.departure_date &&
            body.departure_location &&
            body.arrival_date &&
            body.arrival_location &&
            flight_id){
                const newFlight = new Flight({
                    "departure_date": body.departure_date,
                    "departure_location": body.departure_location,
                    "arrival_date": body.arrival_date,
                    "arrival_location": body.arrival_location,
                    "id": flight_id
                });
                const result = newFlight.save();
                if (result) {
                    logger.info(`RES: add flight number ${newFlight.id}`);
                    res.json(result);
                } else {
                    res.status(500).json({status: 500 , msg: `Server error`});
                }
        } else {
            logger.info(`RES: Input error!`);
            res.status(400).json({status: 400 , msg: `Input error!`});
        }
    },
    async updateFlight(req, res) {
        const flight_id = req.path.substring(1);
        logger.info(`REQ: update an flight number: ${flight_id}`);
        if (isNaN(flight_id)){
            logger.info(`RES: input is nan error "${flight_id}"`);
            res.status(400).json({status: 400 , msg: `input is nan error "${flight_id}"!`});
        }
        else {
            let body = req.body;
            let newFlight = await Flight.find({ id: Number(flight_id)})
                .catch(err => {
                    logger.info(`Error getting the data from db: ${err}`);
                    res.status(500).json({status: 500 , msg: `Server error`});
                });
            if (newFlight.length == 0){
                logger.info(`RES: Didn't find flight number: ${flight_id}!`);
                res.status(404).json({status: 404 , msg: `Didn't find flight number: "${flight_id}"!`});
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
                Flight.updateOne({ id: flight_id }, {
                    departure_date: newFlight.departure_date,
                    departure_location: newFlight.departure_location,
                    arrival_date: newFlight.arrival_date,
                    arrival_location: newFlight.arrival_location})
                    .then(docs => {res.json(docs) })
                    .catch(err => {
                        logger.info(`Error update one flight from db: ${err}`);
                        res.status(500).json({status: 500 , msg: `Error update a flight`});
                    });
            }
        }
    },
    async deleteFlight(req, res) {
        const flight_id = req.path.substring(1);
        logger.info(`REQ: delete specific flight number ${flight_id}`);
        if (isNaN(flight_id)){
            logger.info(`RES: input is nan error "${flight_id}"`);
            res.status(400).json({status: 500 , msg: `input is nan error "${flight_id}"!`});
        }
        else{
            const answer = await Flight.find({ id: Number(flight_id)})
            .catch(err => {
                logger.info(`Error getting the data from db: ${err}`);
                res.status(500).json({status: 500 , msg: `Server error`});
            });
            if (answer.length!=0){
                logger.info(`RES: delete flight number: ${flight_id}`);
                Flight.deleteOne ({ id: Number(flight_id)})
                .then(docs => { res.json(docs)})
                .catch(err => {
                    logger.info(`Error deleting flight from db: ${err}`);
                    res.status(500).json({status: 500 , msg: `Server delete error`});
                });
            }
            else{
                logger.info(`RES: Didn't find flight number: ${flight_id}!`);
                res.status(404).json({status: 404 , msg: `RES: Didn't find flight number: ${flight_id}!`});
            }
        }
    }
};
