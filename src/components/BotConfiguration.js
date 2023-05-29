import React, { Component } from 'react'
import tokenLogo from '../token-logo.png'
import ethLogo from '../eth-logo.png'

var PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY
var WSS_PROVIDER = process.env.REACT_APP_WSS_PROVIDER
var HTTPS_PROVIDER = process.env.REACT_APP_HTTPS_PROVIDER
var ACCOUNT_ADDRESS = process.env.REACT_APP_ACCOUNT_ADDRESS
var APP_MNEMONIC = process.env.REACT_APP_MNEMONIC



//updating values
const handleChangePRIVATE_KEY = (event) => {
  PRIVATE_KEY=event.target.value
  
};
const handleChangeWSS_PROVIDER = (event) => {
  WSS_PROVIDER=event.target.value
  
};
const handleChangeHTTPS_PROVIDER = (event) => {
  HTTPS_PROVIDER=event.target.value
  
};
const handleChangeACCOUNT_ADDRESS = (event) => {
  ACCOUNT_ADDRESS=event.target.value
  
};
const handleChangeAPP_MNEMONIC = (event) => {
  APP_MNEMONIC=event.target.value

  //if ((check.match.split("o").length - 1)>11){
    //APP_MNEMONIC=check
    //}
   // else
    //alert("right")
  
};


class BotConfiguration extends Component {
  constructor(props) {
    super(props)
    this.state = {
      output: '0'
    }
  }

  handleClik() {
    // process.env.REACT_APP_PRIVATE_KEY=parseFloat(PRIVATE_KEY  )
     alert(PRIVATE_KEY+ '\n'+
     WSS_PROVIDER+'\n'+
     HTTPS_PROVIDER+'\n'+
       ACCOUNT_ADDRESS+'\n'+
       APP_MNEMONIC); 
   
   
    } 
  render() {
    return (
      <div className="card mb-4" >

      <div className="input-group mb-2">
        <input
          type="text"
          className="form-control form-control-lg"
          ref="input1"
          placeholder="PRIVATE_KEY"
         onChange={handleChangePRIVATE_KEY}

        />
        </div>

        <div className="input-group mb-2">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="WSS_PROVIDER"
          onChange={handleChangeWSS_PROVIDER}
        />
        </div>
        <div className="input-group mb-2">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="HTTPS_PROVIDER"
          onChange={handleChangeHTTPS_PROVIDER}
        />
        </div>
        <div className="input-group mb-2">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="ACCOUNT_ADDRESS"
          onChange={handleChangeACCOUNT_ADDRESS}
        />
        </div>
        <div className="input-group mb-2">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="APP_MNEMONIC"
          onChange={handleChangeAPP_MNEMONIC}
        />
        </div>

        <div>
            
          <button  className="btn btn-primary" onClick = {this.handleClik.bind(this)}>
          {this.state.isToggleOn ? 'Show' : 'Show'}
          </button>

        </div>

      </div>
    );
  }
}

export default BotConfiguration;
