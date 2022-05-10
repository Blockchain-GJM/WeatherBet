pragma solidity ^0.4.17;

// to do:
// init (day D)
// add time constraint

// bet()
// payout(rainVal)
// payout = your_bet + floor(yourbet/yourTeambucket x losing team total)

contract WeatherBet {
    address public manager;

    address[] public rainBetsPlayers;
    uint256[] public rainBetsAmount;
    uint256 public totalBetsonRain;

    address[] public noRainBetsPlayers;
    uint256[] public noRainBetsAmount;
    uint256 public totalBetsonNoRain;

    enum Weather {
        unannounced, // 0
        rain, // 1
        noRain // 2
    }

    uint8 public finalWeather;
    uint256 private MINIMUM_BET = 0.01 ether;

    constructor() public {
        manager = msg.sender;
    }

    modifier restricted() {
        require(msg.sender == manager, "You are not the manager.");
        _;
    }

    modifier hasSufficientFund() {
        require(msg.value >= MINIMUM_BET, "Minimum bet is 0.01 ether.");
        _;
    }

    function enterWithRain() public payable hasSufficientFund {
        rainBetsPlayers.push(msg.sender);
        rainBetsAmount.push(msg.value);
        totalBetsonRain += msg.value;
    }

    function enterWithNoRain() public payable hasSufficientFund {
        noRainBetsPlayers.push(msg.sender);
        noRainBetsAmount.push(msg.value);
        totalBetsonNoRain += msg.value;
    }

    function isRain() private view returns (bool) {
        return finalWeather == uint8(Weather.rain);
    }

    function pickWinner(uint8 _finalWeather) public restricted {
        finalWeather = _finalWeather;

        address[] storage winningPlayers = isRain()
            ? rainBetsPlayers
            : noRainBetsPlayers;
        uint256[] storage winningBetAmount = isRain()
            ? rainBetsAmount
            : noRainBetsAmount;

        for (uint256 i = 0; i < winningPlayers.length; i++) {
            address winner = winningPlayers[i];
            uint256 wonAmout = winningBetAmount[i];

            winner.transfer(wonAmout);
        }

        resetBet();
    }

    function resetBet() private restricted {
        rainBetsPlayers = new address[](0);
        rainBetsAmount = new uint256[](0);
        totalBetsonRain = 0;

        noRainBetsPlayers = new address[](0);
        noRainBetsAmount = new uint256[](0);
        totalBetsonNoRain = 0;

        finalWeather = uint8(Weather.unannounced);
    }

    function destroy() public {
        selfdestruct(manager);
    }
}
