/**
 * Created by jandersen on 2/21/15.
 */

var jsonServer = require('json-server');
var https = require('https');
var fs = require('fs');



var object = {
    profiles: [
        {
            id: 117787249652700998593,
            userId: '117787249652700998593',
            students: [
                {
                    id: "2342342",
                    name: "Ella",
                    calendarIDs: ["jander.me_vhfj574k3cb837tgqe6vrv6e0g@group.calendar.google.com"]
                },
                {
                    id: "aewaef",
                    name: "Nina",
                    calendarIDs: ["jander.me_dmq4di5r67vgkn78u6etvsqa1c@group.calendar.google.com"]
                },
                {
                    id: "erweafe2",
                    name: "Phoebe",
                    calendarIDs: ["jander.me_1e0uquv8m1lh260s4b0i7h2s7o@group.calendar.google.com"]
                }
            ],
            subjects: [
                {
                    id: 'abc',
                    summary: 'Spanish',
                    bgcolor: '#33691e'
                },
                {
                    id: 'def',
                    summary: 'Writing',
                    bgcolor: '#ff5722'
                },
                {
                    id: 'ghi',
                    summary: 'History',
                    bgcolor: '#004d40'
                },
                {
                    id: 'jkl',
                    summary: 'Math',
                    bgcolor: '#0091ea'
                }
            ]
        }
    ]
};

var router = jsonServer.router(object); // Express router
var server = jsonServer.create();       // Express server
var port = process.env.PORT || 9002;



server.use(router);
if(port !== 9002){
    server.listen(port);
} else {

    // This line is from the Node.js HTTPS documentation.
    var options = {
        key: fs.readFileSync('cert/server.key'),
        cert: fs.readFileSync('cert/server.crt')
    };

    // Create an HTTPS service identical to the HTTP service.
    https.createServer(options, server).listen(port);
}
