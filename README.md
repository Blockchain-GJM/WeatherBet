# WeatherBet
Weather Betting Platform run on Solidity

## Description

Smart contract that allows users to bet against each other on the weather in NYC. Users only bet against each other and no other entity. All bets must be placed by 12pm EST the day before. Bets are done for 12:00am to 11:59pm EST of specific day.

## System Description

### Smart Contract

Purpose of the Smart Contract is to hold the funds of the bet, set odds and payout.

#### Definitions
* `day` – span of time between 12:00am and 11:59pm EST on a specific date
* `dayBetAddress` – address for the contract that accepts the bets for day `D`
* `userWallet` - address for the user's wallet
* `transActionHash` - hash for specific transaction performed either (user --> contract) or (contract --> user)
* `amount` - bet amount
* `willRain` - bool value for bet (1 == bet for rain; 0 == bet against rain)
* `rainOdds` - bets for rain / total bets

#### Functions

1. Initialize bet for day `D`
   - IN: `D`
   - OUT: `dayBetAddress`
2. Bet for `D`
   - IN: `willRain`
   - OUT: `transActionHash`
3. Payout for `D`
   - IN: `rainVal`
   - OUT: `transactionHash` for each payout
4. Calculate Odds:
   - IN: `-`
   - OUT: `rainOdds`

### Front End

1. Query Smart Contract for odds
2. Connect User Wallet
3. Get contract for next day

### Backend

1. Initialize new smartcontract for each day at 12pm EST
2. Store all contract addresses for days.
   1. MongoDB: `day:address`
