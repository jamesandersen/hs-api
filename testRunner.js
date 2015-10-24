var Jasmine = require('jasmine');
var SpecReporter = require('jasmine-spec-reporter');
var noop = function() {};

var jrunner = new Jasmine();
jrunner.configureDefaultReporter({print: noop});    // remove default reporter logs
jasmine.getEnv().addReporter(new SpecReporter());   // add jasmine-spec-reporter
jrunner.loadConfig({
    spec_dir: '.',
    spec_files: [
        'utils/test/*.js'
    ],
    helpers: [
        'helpers/**/*.js'
    ]
});                           // load jasmine.json configuration
jrunner.execute();