/**
 * Created by jandersen on 2/21/15.
 */

var jsonServer = require('json-server');
var https = require('https');
var fs = require('fs');

var router = jsonServer.router(__dirname + '/db.json'); // Express router
var server = jsonServer.create();       // Express server
var port = process.env.PORT || 9002;

server.use(router);
if(port !== 9002){
    server.listen(port);
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
                options[match[1]] = fs.readFileSync(match[2]);
            }
        }
    });

    // Fallback to local cert if cert options not passed in
    options.key = options.key || fs.readFileSync(__dirname + '/cert/server.key');
    options.cert = options.cert || fs.readFileSync(__dirname + '/cert/server.crt');

    // Create an HTTPS service identical to the HTTP service.
    https.createServer(options, server).listen(port);
}
