var config = require("../config");

describe("config module", function() {
  
  it("uses environment variable when set", function() {
    // setup
    process.env.AZURE_HOST = "foobar";
    
    // act
    config.reload();
    
    // assert
    expect(config.AZURE_HOST).toBe("foobar");
  });
  
  it("reads secret file when no environment variable", function() {
    delete process.env.AZURE_HOST;
    var localAzureHostValue;
    try {
      localAzureHostValue = require("../../azure_secret.json").host;
    } catch (err){
      console.warn("local secret file expected to exist while running unit tests")
    }
    config.reload();
    expect(config.AZURE_HOST).toBe(localAzureHostValue);
  });
});