const { flights } = require('../data/data');
const fs = require('fs');
const winston_lib = require('winston');
//const bodyParser = require('body-parser');
const logger = winston_lib.createLogger({
    level: 'debug',
    format: winston_lib.format.simple(),
    transports: [
        new winston_lib.transports.File({ filename: 'logs.txt' }),
        new winston_lib.transports.Console()
    ]
});
function getNextId(){
    let answer = 1;
    for (let index = 1; index < flights.length; index++) {
        if (answer<flights[index].id){
            answer=flights[index].id;
        }
    }
    return (answer+1);
}
function searchIdInFlights(n){
    for (let index = 0; index < flights.length; index++) {
        if (n==flights[index].id){
            return index;
        }
    }
    return -1;
}
exports.flightsController = {
    getAllFlights(req, res) {
        logger.info(`REQ: Get all flights`);
        logger.info(`RES: print all flights`);
        res.json(flights);
    },
    getSpecificFlight(req, res) {
        logger.info(`REQ: Get specific flight number ${req.path}`);
        const id = req.path.substring(1);
        if (isNaN(id)){
            logger.info(`RES: INPUT IS NAN ERROR "${id}"`);
            res.status(400).send(`INPUT IS NAN ERROR "${id}"!`); 
        }
        else{
            const i = searchIdInFlights(parseInt(id));
            if (i!=-1){
                logger.info(`RES: print flight number ${id}`);
                res.json(flights[i]);
            }
            else{
                logger.info(`RES: didn't found flight number ${id}`);
                res.status(404).send(`didn't found flight number ${id}!`); 
            }
        }
    },
    createFlight(req, res) {
        logger.info(`REQ: POST add an flight`);
        let body = req.body;
        if (body.departue_date &&
            body.departue_time &&
            body.departue_location &&
            body.arrival_date &&
            body.arrival_time &&
            body.arrival_location){
                body.id=getNextId();
                flights.push(body);
                /*fs.writeFile('./data/flights.json', JSON.stringify(flights), function writeJSON(err) {
                if (err) return console.log(err);
                });*/   //write to the file
                logger.info(`RES: add flight number ${body.id}`);
                res.json(flights);
        }
        else{
            logger.info(`RES: INPUT ERROR`);
            res.status(400).send(`INPUT ERROR!`); 
        }
    },
    updateFlight(req, res) {
        logger.info(`update an flight`);
        res.json(flights);
    },
    deleteFlight(req, res) {
        logger.info(`REQ: delete specific flight number ${req.path}`);
        const id = req.path.substring(1);
        if (isNaN(id)){
            logger.info(`RES: INPUT IS NAN ERROR "${id}"`);
            res.status(400).send(`INPUT IS NAN ERROR "${id}"!`); 
        }
        else{
            const i = searchIdInFlights(parseInt(id));
            if (i!=-1){
                logger.info(`RES: delete flight number ${id}`);
                let deletedItem = flights.splice(i,1);
                res.json(deletedItem);
                /*fs.writeFile('./data/flights.json', JSON.stringify(flights), function writeJSON(err) {
                    if (err) return console.log(err);
                });*/   //write to the file
            }
            else{
                logger.info(`RES: didn't found flight number ${id}`);
                res.status(404).send(`didn't found flight number ${id}!`); 
            }
        }
    }
};
