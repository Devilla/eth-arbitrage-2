import React, { Component, useState } from 'react'
import tokenLogo from '../token-logo.png'
import ethLogo from '../eth-logo.png'
import Button from 'react-bootstrap/Button';




class BuyForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      output: '0',
      isToggleOn: true
    }
    this.state = { disabled: false }    
  }
  handleClik() {
    
    this.setState( {disabled: !this.state.disabled} )
    this.setState(prevState => ({
      isToggleOn: !prevState.isToggleOn
    }));
    

  } 

  render() {
    return (
      

      
      <div className="mb-3" onSubmit={(event) => {
          event.preventDefault()
          let etherAmount
          etherAmount = this.input.value.toString()
          etherAmount = window.web3.utils.toWei(etherAmount, 'Ether')
          this.props.buyTokens(etherAmount)
        }}>
        <div>
          <label className="float-left"><b>Set Price Target</b></label>
          <span className="float-right text-muted">
            Balance: {window.web3.utils.fromWei(this.props.ethBalance, 'Ether')}
          </span>
        </div>
        <div className="input-group mb-4">
          <input id="firsttext" 
            type="number"
            onChange={(event) => {
              const etherAmount = this.input.value.toString()
              
            }}
            ref={(input) => { this.input = input }}
            className="form-control form-control-lg"
            placeholder="1.03"
            required 
            disabled = {(this.state.disabled)? "disabled" : ""}/>
           <div className="input-group-append">
            <div className="input-group-text">
            <button  className="btn btn-primary " onClick = {this.handleClik.bind(this)}>
               {this.state.isToggleOn ? 'Enable' : 'Disable'}
              </button>
              
              &nbsp;&nbsp;&nbsp; LUSD
              
            </div>
          </div>
        </div>
        <div>
          <label className="float-left"><b>Set Profit Percentage</b></label>
          <span className="float-right text-muted">
          Default: 3% 
          </span>
        </div>
        <div className="input-group mb-2">
          <input
            type="number"
            className="form-control form-control-lg"
            placeholder="0"
          />
          <div className="input-group-append">
            <div className="input-group-text">
              
              &nbsp; %
            </div>
          </div>
        </div>
        <div className="mb-5">
          <span className="float-left text-muted">Maximum loss</span>
          <span className="float-right text-muted">-5% (loss)</span>
        </div>
        <button type="submit" className="btn btn-primary btn-block btn-lg">Start!</button>
      </div>
    );
  }
}

export default BuyForm;
