const createError = require('http-errors');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgon = require('morgan');
const router = require('express').Router();
const winston = require('winston');
const cors = require('cors');

const mongoose = require("mongoose");

const config = require('./api/config/config.json');

const logger = winston.createLogger({
    transports: [
        new (require('winston-daily-rotate-file'))({
            maxDays: 5,
            datePattern: 'YYYY-MM-DD',
            name: 'info',
            filename: './logger/info/%DATE% - info.log',
            level: 'info'
        }),
        new (require('winston-daily-rotate-file'))({
            maxDays: 5,
            datePattern: 'YYYY-MM-DD',
            name: 'error',
            filename: './logger/error/%DATE% - error.log',
            level: 'error'
        })
    ]
});

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

require("./api/utilities/DBManager")(config, mongoose, logger);

// view engine setup
app.use(cors());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(morgon('short'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({limit: '2mb'}));
app.use(bodyParser.urlencoded({limit: '2mb', extended: true}));
app.use(express.json());
app.use("/", router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

//HTTP configurations
const server = require('http').createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
const fd = function (err, succ) {
    if (err)
        console.log(err);
    else
        console.log("server running on " + config.settings.port);
}

server.listen(config.settings.port, fd);
require('./api/routes/routes')(app, router, logger, config, mongoose);

module.exports = server