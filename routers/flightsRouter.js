const { Router } = require('express');
const { flightsController } = require('../controllers/flightsController');
const flightsRouter = new Router();
flightsRouter.get('/', flightsController.getAllFlights); // localhost:3000/api/flights/
flightsRouter.get('/:id', flightsController.getSpecificFlight); // localhost:3000/api/flights/6
flightsRouter.post('/', flightsController.createFlight); // localhost:3000/api/flights/
flightsRouter.patch('/:id', flightsController.updateFlight); // 
flightsRouter.delete('/:id', flightsController.deleteFlight); //
module.exports = { flightsRouter };
