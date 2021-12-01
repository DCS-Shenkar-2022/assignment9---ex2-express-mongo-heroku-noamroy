const { Router } = require('express');
const { authorizationController } = require('../controllers/authorizationController');
const authorizationRouter = new Router();
authorizationRouter.post('/auth', authorizationController.getToken); //
authorizationRouter.use('/', authorizationController.authenticateToken); //
module.exports = { authorizationRouter };


