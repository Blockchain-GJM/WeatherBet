const TestWeatherBet = artifacts.require("WeatherBet");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("WeatherBet", function (/* accounts */) {
  it("should assert true", async function () {
    await TestWeatherBet.deployed();
    return assert.isTrue(true);
  });
});
