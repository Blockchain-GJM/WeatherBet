import React, { Component } from "react";
import { ethers } from "ethers";

import './App.css';

class App extends Component{

  constructor(props) {
      super(props)
      this.state = {input: 0, choose_rain: true, wallet: {address:null, balance:null}}
  }

  checkWallet = (setWallet) => {
    var button = null

    if(this.state.wallet.address){

        //there is a connected wallet
        button = <button className="connect-button button-primary"
                    onClick={()=>this.logoutWalletHandler()}>
                    Logout
                    </button>

    } else {
        //wallet doesnt exist
        button = <button className="connect-button button-primary"
                    style={{ backgroundColor: "red", borderColor: "red"}}
                    onClick={() => this.connectWalletHandler()}>
                    Connect Wallet
                    </button>
    }
    return(button);
  } 

  render(){
    return (
      <div className="App">

        <div className="navbar">
          <div className="logo">
              <span className="logo-text">
                  <span className="logo-text-front">WEATHER</span>
                  <span>BET</span>
              </span>

              <div className="nav-links">
                  {this.state.wallet.address && <button className="portfolio-button">
                      <Link className = "nav-link-text" 
                      style={{color:"#5ac2f1"}}
                      to='/portfolio'> My Portfolio</Link>
                  </button>}
                  <div className="spacer"></div>
                  {this.checkWallet()}
              </div>
          </div>
        </div>


      </div>
    );
  }
}

export default App;
