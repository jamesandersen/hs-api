var constants = require("../constants");
var tokens = require("../tokens");
var httpMocks = require('node-mocks-http');

describe("tokens module", function() {
  it("extracts a token when present", function() {
    var signedCookies = {};
        signedCookies[constants.HSP_TOKEN] = "e13a3d2b6ef3dffda59390491e4f41c5a5663a7abaab03584ceacbc428a687b3a396831d8494d8eaaafe9150629ce90330802a6439d491c992946082e47b54e232b4f51a55be61c01d4584";
        
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
    
    expect(response.locals[constants.HSP_TOKEN]).toBe("ya29.EwL-NgEFBAZdFVNkLAaypu5IIAQXWoDKx-Zw1UCegXDw8MGLepSfP5fRxvw99Hy7H4zstg");
  });
});