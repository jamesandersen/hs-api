/**
 * Created by jandersen on 2/21/15.
 */

var jsonServer = require('json-server');

var object = {
    posts: [
        { id: 1, body: 'foo' }
    ]
};

var router = jsonServer.router(object); // Express router
var server = jsonServer.create();       // Express server

server.use(router);
server.listen(3000);