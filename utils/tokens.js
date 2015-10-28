var crypto = require('crypto'),
    config = require('./config'),
    algorithm = 'aes-256-ctr',
    password = config.GOOGLE_CLIENT_SECRET || 'd6F3QSDffeq';

function setToken(res, tokensInfo) {
  var opts = { expires: new Date(tokensInfo.expiry_date), httpOnly: true, signed: true };
  var encryptedToken = encrypt(JSON.stringify({token: tokensInfo.access_token, expiry: tokensInfo.expiry_date }));
  res.cookie(config.HSP_TOKEN, encryptedToken, opts);
}

function encrypt(text){
  var cipher = crypto.createCipher(algorithm, password)
  var crypted = cipher.update(text,'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm, password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

function extractToken(req, resp, next) {
  if(req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    resp.locals[config.HSP_TOKEN] = req.headers.authorization.substr(7);
  }
  next();
}

module.exports = { extractToken: extractToken, setToken: setToken, encrypt: encrypt, decrypt: decrypt };