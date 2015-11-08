const PROFILES_MODEL = "PROFILES_MODEL";

var express = require('express');
var config = require('../utils/config');
var tokenUtils = require('../utils/tokens');

var google = require('googleapis');
var plus = google.plus('v1');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(config.GOOGLE_CLIENT_ID, config.GOOGLE_CLIENT_SECRET, config.GOOGLE_REDIRECT_URIS[2]);

var DocumentDBClient = require('documentdb').DocumentClient;
var docDbClient = new DocumentDBClient(config.AZURE_HOST, {
    masterKey: config.AZURE_AUTH_KEY
});

var ProfilesDao = require('../models/profiles');
var profilesDao = new ProfilesDao(docDbClient, config.AZURE_DB_ID, config.AZURE_PROFILE_COLLECTION_ID);
profilesDao.init();

var router = express.Router();

function getProfilesModel(req) {
  return new Promise(function (resolve, reject) {
    if (req.app.locals[PROFILES_MODEL]) {
      resolve(req.app.locals[PROFILES_MODEL]);
    } else {
      var ProfilesDao = require('../models/profiles');
      var profilesDao = new ProfilesDao(docDbClient, config.AZURE_DB_ID, config.AZURE_PROFILE_COLLECTION_ID);
      profilesDao.init();
      req.app.locals[PROFILES_MODEL] = profilesDao;
      resolve(profilesDao);
    }
  });
}

function getTokenViaLocalsOrAuthCode(req, res) {
  return new Promise(function(resolve, reject) {
    var token = res.locals[config.HSP_TOKEN];
    if(token) {
      // in this route we're only providing the access_token
      resolve({'access_token': token});
    } else if (req.headers.authorization && req.headers.authorization.startsWith("ECode ") && req.headers.authorization.length > 7) {
      var code = tokenUtils.decrypt(req.headers.authorization.substr(6));
      oauth2Client.getToken(code, function(err, tokens) {
        if(err) {
          reject(err);
        } else {
          // Now tokens contains an access_token and an optional refresh_token. Save them.
          res.locals[config.HSP_TOKEN] = tokens.access_token;
          res.locals[config.HSP_TOKEN_EXPIRY] = tokens.expiry_date;
          resolve(tokens);
        }
      });
    } else {
      reject(new Error("No token or auth code available"));
    }
  });
}


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login', function(req, res){
  // generate a url that asks permissions for Google+ and Google Calendar scopes
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
    scope: config.GOOGLE_SCOPES, // If you only need one scope you can pass it as string
    state: req.get('Referer')
  });
  res.send(url);
});

router.get('/profile', function(req, res, next) {
  // Retrieve tokens via token exchange explained above or set them:
  
  var tokenPromise = getTokenViaLocalsOrAuthCode(req, res)
    .then(function(tokenInfo) {
      oauth2Client.setCredentials(tokenInfo);
      return new Promise(function(resolve, reject) {
        plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, response) {
          if(err) {
            reject(err);
          } else {
            resolve(response);
          }
        });
      });
    })
    .then(function(googleMe) {
      profilesDao.getById(googleMe.id)
        .then(function (profile) {
          res.send({
            profile: profile, 
            me: googleMe,
            'access_token': res.locals[config.HSP_TOKEN],
            'token_expiry': res.locals[config.HSP_TOKEN_EXPIRY]
            });
        })
        .catch(function (getByIdErr) {
            var sp = require('../db.json').profiles.find(function(p) { return p.userId.toString() === googleMe.id; });
            if (sp) {
              sp.id = sp.userId;
              profilesDao.add(sp).then(function(profile) {
                res.send({
                  profile: sp, 
                  me: googleMe,
                  'access_token': res.locals[config.HSP_TOKEN],
                  'token_expiry': res.locals[config.HSP_TOKEN_EXPIRY]
                });
              }).catch(next);
            } else {
              next(new Error("No profile available for google user '" + googleMe.id + "'"));
            }
        });
      })
      .catch(next);
});

function oauth2Callback(req, res, next) {
  var state = req.query.state;
  var ecode = tokenUtils.encrypt(req.query.code);
  var url = require('url');
  var urlObj = url.parse(state, true);
  urlObj.hash = "/ec/" + ecode;
  delete urlObj.search; // if search is present then urlObj.query will be ignored
  res.redirect(url.format(urlObj));
}

module.exports = { router: router, oauth2Callback: oauth2Callback };