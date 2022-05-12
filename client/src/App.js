import React, { Component } from "react";
import axios from 'axios';

import {test, approve} from './Payment';

import './App.css';

class App extends Component{

  constructor(props) {
    super(props)
    this.state = {input: "0", choose_rain: true, wallet: null, network_id: null, payout:0,
                  contract:null, connected: false, locked: true}
  }

  componentDidMount(){
    console.log("Requesting Odds")
    axios.get("http://localhost:3001/data")
      .then(res => this.handleOddsJson(res))
  }

  checkWallet = () => {
    var button = null

    if(this.state.wallet){

        //there is a connected wallet
        button = <button className="connect-button button-primary"
                    onClick={this.logoutWalletHandler}
                    >
                    Logout
                    </button>

    } else {
        //wallet doesnt exist
        button = <button className="connect-button button-primary"
                    style={{ backgroundColor: "red", borderColor: "red"}}
                    onClick={this.connectWalletHandler}
                    >
                    Connect Wallet
                    </button>
    }
    return(button);
  } 

  logoutWalletHandler = () => {
    this.setState({wallet: null})
  }

  connectWalletHandler = async() => {
    if (window.aleereum){
        const provider = window["aleereum"]

        if(provider.isAle){
          const connectStatus = provider.connect()
          const isConnected = provider.isConnected
          const islocked = provider.islocked
          const networkId = provider.networkId
          const account = provider.account

          this.setState({wallet: account, network_id: networkId, connected: isConnected})



        } else {
          alert("Please use AleWallet")
        }

    } else {
        alert("Please install AleWallet")
    }
  }

  handleInputChange = amt => {
    console.log(amt)
    this.setState({input : amt})
  }

  handleChoice = (choice) => {
    console.log(choice)
    if(choice == "0"){
      this.setState({choose_rain : true})
    } else {
      this.setState({choose_rain : false})
    }
  }

  handleBet = event => {
    event.preventDefault()
    var amt = event.target.betAmount.value
    var password = event.target.password.value
    var rain_chosen = this.state.choose_rain

    console.log(amt)
    console.log(password)
    console.log(rain_chosen)
    console.log("Current Contract", this.state.contract)

    approve(this.state.wallet, amt, password, rain_chosen, this.state.contract)
      .then((res)=>{console.log(res)})
  }

  // open console, click "R" see data
  // TODO: request upon opening page/refresh/make maybe even run every 30 seconds
  getOdds = event => {
    event.preventDefault()
    //check validity of input
    if(isNaN(+(this.state.input))){
      console.log("Invalid Input")
      return
    }

    console.log("Requesting Odds")
    axios.get("http://localhost:3001/data")
      .then(res => this.handleOddsJson(res))
  }

  handleOddsJson = (input) => {
    var data = input.data
    this.setState({contract:data.contract})

    var win_bet = 0.0
    var lose_bet = 0.0

    if(this.state.choose_rain){
      win_bet = data.rain
      lose_bet = data.norain
    } else {
      lose_bet = data.rain
      win_bet = data.norain
    }

    if(lose_bet == 0){
      this.setState({payout: 0})
      return
    }

    var payout = parseFloat(this.state.input) + lose_bet*(this.state.input*1.0/(win_bet+parseFloat(this.state.input)))

    this.setState({payout: payout})
  }

  render(){
    return (
      <div className="main-container">

        <div className="navbar">
          <div className="logo">
              <span className="logo-text">
                  <span className="logo-text-front">WEATHER</span>
                  <span>BET</span>
              </span>

              <div className="nav-links">
                  <div className="spacer"></div>
                  {this.checkWallet()}
              </div>
          </div>
        </div>

        <div className="bet-container">

          <form className="input-container" onSubmit={e => this.handleBet(e)}>
            <label className="input-label">Betting Amount</label>
            
            <div className="spacer"></div>

            <input
                type="number"
                name="betAmount"
                step="0.01"
                min="0.01"
                placeholder="ComputeCoin Input"
                className="input-text"
                onChange={e => this.handleInputChange(e.target.value)}
                />
            
            <div className="spacer"></div>

            <select id="betChoice" className="input-dropdown" name="betSelection"
              onChange={e => this.handleChoice(e.target.value)}>
                <option value="0">Rain</option>
                <option value="1">No Rain</option>
            </select>

            <div className="spacer"></div>

            <input
                type="text"
                name="password"
                placeholder="password"
                className="input-text"/>

            <div className="spacer"></div>

            <div className="odds">
              <div className="input-text">Potential Payout: {this.state.payout}</div>
              <div className="spacer"></div>
              <button className="refresh-button"
                onClick={this.getOdds}
                >
                R
              </button>
            </div>

            <div className="spacer"></div>

            {this.state.wallet && <button
              className="submit-button" type="submit">
              Bet
            </button>}

          </form>

        </div>

      </div>
    );
  }
}

export default App;
