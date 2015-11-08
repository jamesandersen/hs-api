var config = require("../config");
var tokens = require("../tokens");
var httpMocks = require('node-mocks-http');

describe("tokens module", function() {
  var clear = {"access_token":"ya29.GgLsFcqZtxZ8eBrX_a0zcdhTXKS-Nud-pLWM5OQk4XIwnv5IxjyCbGHUNrZKMZsmBqmhsQ", "expiry_date": 1446005922850 };
  var secret = "e3797b7d2bd3c693b2ff8e6d6a342ed8a66c1f72b296184d4dc08694239d9ebd9af1963aab84a1e8969ce95d729f9c370bef2a163ae08aaeac8d228ac0366bed61f4fe0125be00f41c6ba8136fdfc42485557119439bbe4526f141fc4f8a0c5ad04179feffda710c5fae4eb4641d";
  
  
  it("sets a token ", function() {
    var response  = httpMocks.createResponse();
    tokens.setToken(response, clear);
    expect(response.cookies[config.HSP_TOKEN]).not.toBe(undefined);
    expect(response.cookies[config.HSP_TOKEN].value).toBe(secret);
  });
  
  it("extracts a token when present", function() {
    var signedCookies = {};
        signedCookies[config.HSP_TOKEN] = secret;
        
    var request  = httpMocks.createRequest({
        method: 'GET',
        url: '/user/42',
        params: {
          id: 42
        },
        signedCookies: signedCookies
    });
 
    var response = httpMocks.createResponse();
    response.locals = {};
    tokens.extractToken(request, response, function() {})
    
    expect(response.locals[config.HSP_TOKEN]).toBe(clear.access_token);
    expect(response.locals[config.HSP_TOKEN_EXPIRY]).toBe(clear.expiry_date);
  });
});