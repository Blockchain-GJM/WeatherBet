const WeatherBet = artifacts.require("WeatherBet");

module.exports = function (deployer) {
  deployer.deploy(WeatherBet);
};
