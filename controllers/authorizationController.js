const { json } = require('express');
const winston_lib = require('winston');
const User = require('../models/user');
const jwt = require ('jsonwebtoken');
const logger = winston_lib.createLogger({
    level: 'debug',
    format: winston_lib.format.simple(),
    transports: [
        new winston_lib.transports.File({ filename: 'logs.txt' }),
        new winston_lib.transports.Console()
    ]
});
/*~~~~~~~~~~GENERATE TOKKEN FUNCTIUON~~~~~*/
function generateAccessToken(username) {
    return jwt.sign(username, process.env.TOKEN_SECRET, {expiresIn: '6000s'})
}
/*~~~~~~~~functions~~~~~~~~~~*/
exports.authorizationController = {
    async getToken(req, res) {
        logger.info(`REQ: Get Token`);
        let _id = req.body.id;
        logger.info(`REQ: Get specific id number ${_id}`);
        if (isNaN(_id)){
            logger.info(`RES: input is nan error "${_id}"`);
            res.status(400).send(`input is nan error "${_id}"!`); 
        }
        else{
            const answer = await User.find({ id: Number(_id)})
            .catch(err => logger.info(`Error getting the data from db: ${err}`));
            if (answer.length!=0){
                logger.info(`RES: authentication success: ${_id}`);
                const token = generateAccessToken({ _id });
                logger.info(`RES: success generate token`);
                res.json({"token" : token});
            }
            else{
                logger.info(`RES: Didn't find user number: ${_id}!`);   
                res.status(404).send(`RES: Didn't find user number: ${_id}!`); 
            }
        }
    },
    async authenticateToken(req, res, next) {
        logger.info (`REQ: START authentication test`);
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token == null){
            logger.info (`RES: FAIL authentication test`);
            return  res.status(401).send(`RES: un-authorized!`);
        }
        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err){
                logger.info (`AUTHENTICATION ERROR: ${err}`);
                return  res.status(403).send(`AUTHENTICATION ERROR!`);
            }
            req.user = user;
            logger.info (`RES: SUCCESS authentication test`);
            next();
        });
    }
};
