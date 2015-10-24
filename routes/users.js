var express = require('express');
var google = require('googleapis');
var constants = require('../utils/constants');
var plus = google.plus('v1');
var tokenUtils = require('../utils/tokens');

var OAuth2 = google.auth.OAuth2;
var key = require('../client_secret.json');
var oauth2Client = new OAuth2(key.web.client_id, key.web.client_secret, key.web.redirect_uris[2]);

var DocumentDBClient = require('documentdb').DocumentClient;
var config = require('../config');
var docDbClient = new DocumentDBClient(config.host, {
    masterKey: config.authKey
});
var ProfilesDao = require('../models/profiles');
var profilesDao = new ProfilesDao(docDbClient, config.databaseId, config.collectionId);
profilesDao.init();


var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login', function(req, res){
  // generate a url that asks permissions for Google+ and Google Calendar scopes
  var scopes = [
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/calendar'
  ];
  
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
    scope: scopes // If you only need one scope you can pass it as string
  });
  res.redirect(url);
});

router.get('/profile', function(req, res) {
  // Retrieve tokens via token exchange explained above or set them:
  oauth2Client.setCredentials({
    access_token: res.locals[constants.HSP_TOKEN]
  });
  
  plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, response) {
    if(err) {
      throw err;
    }
    
    profilesDao.getById(response.id, function(err, profile) {
      if(err) {
        throw err;
      }
      
      if(!profile.id) {
        var staticProfiles = require('../db.json');
        var sp = null;
        staticProfiles.profiles.forEach(function(p) {
          if(p.userId.toString() === response.id) {
            sp = p;
          }
        });
        if(sp ) {
          sp.id = sp.userId;
          profilesDao.add(sp, function(err) {
            if(err) {
              throw err;
            }
            res.send({profile: sp, me: response });
          });
        } else {
          throw "no profile";
        }
        
      } else {
        res.send({profile: profile, me: response });
      }
    });
  });
});

function oauth2Callback(req, res, next) {
  oauth2Client.getToken(req.query.code, function(err, tokens) {
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    if(!err) {
      tokenUtils.setToken(res, tokens);
      oauth2Client.setCredentials(tokens);
    }
    
    res.redirect('users/profile');
  });
}

module.exports = { router: router, oauth2Callback: oauth2Callback };