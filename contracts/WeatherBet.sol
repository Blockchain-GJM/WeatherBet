pragma solidity ^0.4.17;

contract WeatherBet {
    // Tunable variables
    uint256 private VALID_WINDOW = 11 hours + 59 minutes + 59 seconds;
    uint256 private MINIMUM_BET = 0.01 ether;

    address public manager;
    uint256 public createdTime; // backend needs to ensure this is called at the right time

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

    constructor() public {
        manager = msg.sender;
        createdTime = now;
    }

    modifier restricted() {
        require(msg.sender == manager, "You are not the manager.");
        _;
    }

    modifier hasSufficientFund() {
        require(msg.value >= MINIMUM_BET, "Minimum bet is 0.01 ether.");
        _;
    }

    modifier isValidTime() {
        require(
            block.timestamp <= createdTime + VALID_WINDOW,
            "Time expired. Action rejected."
        );
        _;
    }

    function enterWithRain() public payable hasSufficientFund isValidTime {
        rainBetsPlayers.push(msg.sender);
        rainBetsAmount.push(msg.value);
        totalBetsonRain += msg.value;
    }

    function enterWithNoRain() public payable hasSufficientFund isValidTime {
        noRainBetsPlayers.push(msg.sender);
        noRainBetsAmount.push(msg.value);
        totalBetsonNoRain += msg.value;
    }

    function isRain() private view returns (bool) {
        return finalWeather == uint8(Weather.rain);
    }

    function getWonAmount(uint256 originalBet, bool hasRained)
        private
        view
        returns (uint256)
    {
        uint256 losingTotalBet = hasRained
            ? totalBetsonNoRain
            : totalBetsonRain;
        uint256 winningTotalBet = hasRained
            ? totalBetsonRain
            : totalBetsonNoRain;

        return originalBet + (losingTotalBet * originalBet) / winningTotalBet;
    }

    function hasRained() private view returns (bool) {
        return finalWeather == uint8(Weather.rain);
    }

    function payout(uint8 _finalWeather) public restricted {
        finalWeather = _finalWeather;
        require(finalWeather != 0, "Weather has not been announced yet.");

        address[] storage winningPlayers = isRain()
            ? rainBetsPlayers
            : noRainBetsPlayers;
        uint256[] storage winningBetAmount = isRain()
            ? rainBetsAmount
            : noRainBetsAmount;

        for (uint256 i = 0; i < winningPlayers.length; i++) {
            address winner = winningPlayers[i];
            uint256 originalBet = winningBetAmount[i];

            uint256 wonAmout = getWonAmount(originalBet, hasRained());

            winner.transfer(wonAmout);
        }

        resetBet();
    }

    function cancelBet() public restricted {
        uint256 i;
        uint256 originalBet;
        address player;

        // return money to those betting on rains
        for (i = 0; i < rainBetsPlayers.length; i++) {
            player = rainBetsPlayers[i];
            originalBet = rainBetsAmount[i];

            player.transfer(originalBet);
        }

        // return money to those betting on no rains
        for (i = 0; i < noRainBetsPlayers.length; i++) {
            player = noRainBetsPlayers[i];
            originalBet = noRainBetsAmount[i];

            player.transfer(originalBet);
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
        createdTime = block.timestamp;
    }

    function destroy() public {
        selfdestruct(manager);
    }
}
