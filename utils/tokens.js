var crypto = require('crypto'),
    constants = require('./constants'),
    algorithm = 'aes-256-ctr',
    password = constants.CLIENT_SECRET || 'd6F3QSDffeq';

function setToken(res, tokensInfo) {
  var opts = { expires: new Date(tokensInfo.expiry_date), httpOnly: true, signed: true };
  var encryptedToken = encrypt(tokensInfo.access_token);
  res.cookie(constants.HSP_TOKEN, encryptedToken, opts);
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
  var encryptedToken = req.signedCookies[constants.HSP_TOKEN];
  if(encryptedToken) {
    resp.locals[constants.HSP_TOKEN] = decrypt(encryptedToken);
  }
  next();
}

module.exports = { extractToken: extractToken, setToken: setToken };