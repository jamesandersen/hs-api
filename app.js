// Todo App
var config = require('./utils/config');
var tokens = require('./utils/tokens');
var Profiles = require('./routes/profiles');
var ProfilesDao = require('./models/profiles');

var users = require('./routes/users');

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var fs = require('fs');
var cors = require('cors');
var https = require('https');

var whitelist = [
    'http://localhost', // add here the url when you access to your angular app
    'https://localhost:9001',
    'http://jander.me'
];

var corsOptions = {
    credentials: true,
    origin: function(origin, callback) {
        console.log('foo: ' + origin);
        var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        callback(null, originIsWhitelisted);
    },
    methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: 'accept, content-type, Authorization'
};
app.use(cors(corsOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.GOOGLE_CLIENT_SECRET));
app.use(tokens.extractToken);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', users.router);
app.use('/oauth2Callback', users.oauth2Callback);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//app.listen(3000);

var port = process.env.PORT || 9002;
if(port !== 9002){
    app.listen(port);
} else {

    // Parse options
    var optionsRegex = /^-(.*)=(.*)$/,
        match = null,
        options = {};
    process.argv.forEach(function (val, index, array) {
        if(match = val.match(optionsRegex)) {
            options[match[1]] = match[2];
            // console.log(match[1]+ ': ' + match[2]);

            if(match[1] == "key" || match[1] == "cert") {
                var aPath = match[2];
                if(path.resolve(aPath) !== path.normalize(aPath)) {
                    aPath = path.join(__dirname, aPath);
                }
                
                options[match[1]] = fs.readFileSync(aPath);
            }
        }
    });

    // Fallback to local cert if cert options not passed in
    options.key = options.key || fs.readFileSync(__dirname + '/cert/server.key');
    options.cert = options.cert || fs.readFileSync(__dirname + '/cert/server.crt');

    // Create an HTTPS service identical to the HTTP service.
    https.createServer(options, app).listen(port);
}

module.exports = app;