var constants = {},
	secrets = require('../client_secret.json'),
	client_secret = process.env.CLIENT_SECRET || secrets && secrets.web.client_secret;

function define(name, value) {
    Object.defineProperty(constants, name, {
        value:      value,
        enumerable: true
    });
}

define("CLIENT_SECRET", client_secret);
define("HSP_TOKEN", "HSPT");

module.exports = constants;