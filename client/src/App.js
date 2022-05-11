import React, { Component } from "react";

import './App.css';
import axios from 'axios';

class App extends Component{

  constructor(props) {
      super(props)
      this.state = {input: 0, choose_rain: true, wallet: null, network_id: null, odds: null}
  }

  checkWallet = () => {
    var button = null

    if(this.state.wallet){

        //there is a connected wallet
        button = <button className="connect-button button-primary"
                    onClick={()=>this.logoutWalletHandler()}
                    >
                    Logout
                    </button>

    } else {
        //wallet doesnt exist
        button = <button className="connect-button button-primary"
                    style={{ backgroundColor: "red", borderColor: "red"}}
                    onClick={() => this.connectWalletHandler()}
                    >
                    Connect Wallet
                    </button>
    }
    return(button);
  } 

  logoutWalletHandler = () => {
    this.setState({wallet: null})
  }

  connectWalletHandler = () => {
    console.log(window["aleereum"])
    if (window.aleereum){
        const provider = window["aleereum"]

        if(provider.isAle){

          this.setState({wallet : {address : provider.account}, network_id: provider.networkId})

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

  handleBet = () => {
    console.log("Sent Bet")
    axios.post("http://localhost:3001/bet", {params: this.state})
      .then(res => {
        console.log(res.data)
      })
  }

  getOdds = event => {
    event.preventDefault()
    console.log("Requesting Odds")
    axios.get("http://localhost:3001/odds", {params: {rain_chosen: this.state.choose_rain}})
      .then(res => this.setState({odds: res.data}))
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

        <div style={{ marginTop: 20 }}>{JSON.stringify(this.state)}</div>

        <div className="bet-container">

          <form className="input-container">
            <label className="input-label">Betting Amount</label>
            
            <div className="spacer"></div>

            <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="ComputeCoin Input"
                className="input-text"
                onChange={e => this.handleInputChange(e.target.value)}
                />
            
            <div className="spacer"></div>

            <select id="betChoice" className="input-dropdown" name="rain"
              onChange={e => this.handleChoice(e.target.value)}>
                <option value="0">Rain</option>
                <option value="1">No Rain</option>
            </select>

            <div className="spacer"></div>

            <div className="odds">
              <div className="input-text">Current Odds: {this.state.odds}</div>
              <div className="spacer"></div>
              <button className="refresh-button"
                onClick={this.getOdds}
                >
                R
              </button>
            </div>

            <div className="spacer"></div>

            <button
              className="submit-button" type="submit" value="Submit"
              onClick={this.handleBet}>
              Bet
            </button>

          </form>

        </div>

      </div>
    );
  }
}

export default App;
