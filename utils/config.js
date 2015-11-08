 var fs = require("fs");
 var path = require("path");


const NODE_ENV = "NODE_ENV";
const DEVELOPMENT = "DEVELOPMENT";
const GOOGLE_SCOPES = "GOOGLE_SCOPES";
const GOOGLE_CLIENT_ID = "GOOGLE_CLIENT_ID";
const GOOGLE_CLIENT_SECRET = "GOOGLE_CLIENT_SECRET";
const GOOGLE_REDIRECT_URIS = "GOOGLE_REDIRECT_URIS";
const AZURE_HOST = "AZURE_HOST";
const AZURE_AUTH_KEY = "AZURE_AUTH_KEY";
const AZURE_DB_ID = "AZURE_DB_ID";
const AZURE_PROFILE_COLLECTION_ID = "AZURE_PROFILE_COLLECTION_ID";

var config = { reload: load },
    secret_files = {},
    allowReload = (process.env[NODE_ENV] || '').toUpperCase() === DEVELOPMENT;

function define(name, value) {
    Object.defineProperty(config, name, {
        value: value,
        configurable: (process.env[NODE_ENV] || '').toUpperCase() === DEVELOPMENT,
        enumerable: true
    });
}

function defineByEnvOrSecret(name, secret_fallback_file, secretPath) {
    // In production, these should all be set as environment variables
    var value = process.env[name];
    
    // for development they can be read from local "secret" files that are NOT in source control
    if(!value) {
        if(!secret_files[secret_fallback_file]) {
            try {
                secret_files[secret_fallback_file] = JSON.parse(fs.readFileSync(path.join(__dirname, secret_fallback_file), "utf8"));
            } catch (err) {
                console.error("Unable to set '" + name + "' from '" + secretPath + "' in '" + secret_fallback_file + "': " + err);
            }
        }
        
        value = secretPath.split('.').reduce(function(memo, token) {
            return memo != null && memo[token];
        }, secret_files[secret_fallback_file]);
    }
    
    define(name, value);
}

function load() {
    define("HSP_TOKEN", "HSPT");
    define("HSP_TOKEN_EXPIRY", "HSPT_EXPIRY");
    // Full Drive access - needed to not only create new files but also modify permissions on existing files that are added to events
    define(GOOGLE_SCOPES, ["profile", "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/drive"]);
    defineByEnvOrSecret(GOOGLE_CLIENT_ID, "../client_secret.json",  "web.client_id");
    defineByEnvOrSecret(GOOGLE_CLIENT_SECRET, "../client_secret.json",  "web.client_secret");
    defineByEnvOrSecret(GOOGLE_REDIRECT_URIS, "../client_secret.json",  "web.redirect_uris");
    defineByEnvOrSecret(AZURE_HOST, "../azure_secret.json",  "host");
    defineByEnvOrSecret(AZURE_AUTH_KEY, "../azure_secret.json",  "authKey");
    defineByEnvOrSecret(AZURE_DB_ID, "../azure_secret.json",  "databaseId");
    defineByEnvOrSecret(AZURE_PROFILE_COLLECTION_ID, "../azure_secret.json",  "collectionId");
}

load();

module.exports = config;