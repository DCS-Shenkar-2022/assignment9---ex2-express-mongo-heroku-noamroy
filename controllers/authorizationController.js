//~~~~~~~~INCLUDES~~~~~~~~~~~~~
const User = require('../models/user');
//~~~~~~~~LOGGER SET UP~~~~~~~~~~~~~
const winston_lib = require('winston');
const logger = winston_lib.createLogger({
    level: 'debug',
    format: winston_lib.format.simple(),
    transports: [
        new winston_lib.transports.File({ filename: 'logs.txt' }),
        new winston_lib.transports.Console()
    ]
});
//~~~~~~~~~~INNER FUNCTIONS~~~~~
function generateAccessToken(username) {
    let str = Math.random().toString(16).toUpperCase();
    return '00000000'.slice(str.length) + str;
}
//~~~~~~~~EXPORTED FUNCTIONS~~~~~~~~~~
exports.authorizationController = {
    async getToken(req, res) {
        let _id = req.body.id;
        let minutesToAdd=10;
        logger.info(`REQ: Get Token for id number ${_id}`);
        if (isNaN(_id)){
            logger.info(`RES: input is nan error "${_id}"`);
            res.status(400).json({status: 400 , msg: `input is nan error "${_id}"`});
        }
        else{
            let newUser = await User.find({ id: Number(_id)})
            .catch(err => logger.info(`Error getting the data from db: ${err}`));
            if (newUser.length!=0){
                const currentDate = new Date();
                const _tokenPass = generateAccessToken(_id);
                const _tokenExpired = new Date(currentDate.getTime() + minutesToAdd*60000);
                User.updateOne({ id: Number(_id) }, {
                    tokenPass: _tokenPass,
                    tokenExpired: _tokenExpired})
                    .catch(err => logger.info(`Error update token of user from db: ${err}`));                
                logger.info(`RES: success generate token`);
                res.status(200).json({status: 200 , msg: "success generate token" , token: _tokenPass});
            }
            else{
                logger.info(`RES: Didn't find user number: ${_id}!`);
                res.status(404).json({status: 404 , msg: `Didn't find user ${_id}`});
            }
        }
    },
    async authenticateToken(req, res, next) {
        logger.info (`REQ: START authentication test`);
        const authHeader = req.headers['authorization'];
        if (authHeader == null){
            logger.info (`RES: un-authorized: no token`);
            res.status(401).json({status: 401 , msg: `un-authorized: no token`});
        }
        else{
            const user = await User.find({ tokenPass: authHeader})
                .catch(err => logger.info(`Error getting the data from db: ${err}`));
            if (user.length!=0){
                const nowTime = new Date();
                if (nowTime<(user[0]).tokenExpired){
                    req.user = user[0];
                    logger.info (`RES: SUCCESS authentication test`);
                    next();
                }
                else {
                    logger.info (`RES: un-authorized: expired token`);
                    res.status(401).json({status: 401 , msg: `un-authorized: expired token`});
                }
            }
            else{
                logger.info (`RES: un-authorized: wrong token`);
                res.status(401).json({status: 401 , msg: `un-authorized: wrong token`});
                next();
            };
        }
    }
};
