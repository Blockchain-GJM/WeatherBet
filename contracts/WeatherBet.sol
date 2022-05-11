//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract WeatherBet {
    // Tunable variables
    uint256 private VALID_WINDOW = 24 hours;
    uint256 private MINIMUM_BET = 0.01 ether;

    uint8 private RAIN = 1;
    uint8 private NO_RAIN = 2;

    address public manager;

    uint256 public createdTime; // backend needs to ensure this is called at the right time
    bool expired;

    address payable[] public rainBetsPlayers;
    uint256[] public rainBetsAmount;
    uint256 public totalBetsonRain;

    address payable[] public noRainBetsPlayers;
    uint256[] public noRainBetsAmount;
    uint256 public totalBetsonNoRain;

    enum Weather {
        unannounced, // 0
        rain, // 1
        noRain // 2
    }

    uint8 public finalWeather;

    constructor() {
        manager = msg.sender;
        createdTime = block.timestamp;
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
            !expired,
            // block.timestamp <= createdTime + VALID_WINDOW,
            "Time expired. Action rejected."
        );
        _;
    }

    function enterWithRain() public payable hasSufficientFund isValidTime {
        rainBetsPlayers.push(payable(msg.sender));
        rainBetsAmount.push(msg.value);
        totalBetsonRain += msg.value;
    }

    function enterWithNoRain() public payable hasSufficientFund isValidTime {
        noRainBetsPlayers.push(payable(msg.sender));
        noRainBetsAmount.push(msg.value);
        totalBetsonNoRain += msg.value;
    }

    function isRain() private view returns (bool) {
        return finalWeather == uint8(Weather.rain);
    }

    function getWonAmount(uint256 originalBet, bool rained)
        private
        view
        returns (uint256)
    {
        uint256 losingTotalBet = rained ? totalBetsonNoRain : totalBetsonRain;
        uint256 winningTotalBet = rained ? totalBetsonRain : totalBetsonNoRain;

        return originalBet + (losingTotalBet * originalBet) / winningTotalBet;
    }

    function hasRained() private view returns (bool) {
        return finalWeather == uint8(Weather.rain);
    }

    function hasAnnounced() private view returns (bool) {
        return finalWeather == RAIN || finalWeather == NO_RAIN;
    }

    function payout(uint8 _finalWeather) public restricted {
        finalWeather = _finalWeather;
        require(hasAnnounced(), "Weather has not been announced yet.");

        address payable[] storage winningPlayers = isRain()
            ? rainBetsPlayers
            : noRainBetsPlayers;
        uint256[] storage winningBetAmount = isRain()
            ? rainBetsAmount
            : noRainBetsAmount;

        for (uint256 i = 0; i < winningPlayers.length; i++) {
            address payable winner = winningPlayers[i];
            uint256 originalBet = winningBetAmount[i];

            uint256 wonAmout = getWonAmount(originalBet, hasRained());

            winner.transfer(wonAmout);
        }
    }

    function sendOriginalBetBackToRain() private restricted {
        uint256 i;
        uint256 originalBet;
        address payable player;

        // return money to those betting on rains
        for (i = 0; i < rainBetsPlayers.length; i++) {
            player = rainBetsPlayers[i];
            originalBet = rainBetsAmount[i];

            player.transfer(originalBet);
        }
    }

    function sendOriginalBetBackToNoRain() private restricted {
        uint256 i;
        uint256 originalBet;
        address payable player;

        // return money to those betting on no rains
        for (i = 0; i < noRainBetsPlayers.length; i++) {
            player = noRainBetsPlayers[i];
            originalBet = noRainBetsAmount[i];

            player.transfer(originalBet);
        }
    }

    function cancelBet() public restricted {
        sendOriginalBetBackToRain();
        sendOriginalBetBackToNoRain();
        resetBet();
    }

    function resetBet() private restricted {
        rainBetsPlayers = new address payable[](0);
        rainBetsAmount = new uint256[](0);
        totalBetsonRain = 0;

        noRainBetsPlayers = new address payable[](0);
        noRainBetsAmount = new uint256[](0);
        totalBetsonNoRain = 0;

        finalWeather = uint8(Weather.unannounced);
        createdTime = block.timestamp;
        expired = false;
    }

    function destroy() public restricted {
        sendOriginalBetBackToRain();
        sendOriginalBetBackToNoRain();
        selfdestruct(payable(manager));
    }
}
