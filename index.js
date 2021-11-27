/*~~~~~~~~~~LIBRARIES~~~~~~~~~~~~~*/
const express = require("express");
/*~~~~~~~~~~CREATE SERVER~~~~~~~~~~~~*/
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({extended: true}));
/*~~~~~~~~~~LOGGER SET UP~~~~~~~~~~~~~*/
const winston_lib = require('winston');
const logger = winston_lib.createLogger({
    level: 'debug',
    format: winston_lib.format.simple(),
    transports: [
        new winston_lib.transports.File({ filename: 'logs.txt' }),
        new winston_lib.transports.Console()
    ]
});
var currentdate = new Date(); 
var datetime = currentdate.getDate() + "/" + (currentdate.getMonth()+1)  + "/" + currentdate.getFullYear() +
" | " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
logger.info(`~~~~~~~~~~~~~~~~Start session ${datetime}~~~~~~~~~~~~~~~`);
/*~~~~~~~~~~ROUTERS SET UP~~~~~~~~~~~~~*/
const { flightsRouter } = require("./routers/flightsRouter");
app.use("/api/filghts", flightsRouter);    //binding between router and application*/
const { authorizationRouter } = require("./routers/authorizationRouter");;
app.use("/auth", authorizationRouter);    //binding between router and application*/
/*~~~~~~~~~BAD ROUTE~~~~~~~~*/
app.use((req, res) => { //default router put in end
    res.status(400).send(`something is broken!`);
});
/*~~~~~~~~~LISTENNING~~~~~~~*/
logger.info(`Express server is running on port ${port}`);
app.listen(port, () => console.log(`Express server is running on port ${port}`));
