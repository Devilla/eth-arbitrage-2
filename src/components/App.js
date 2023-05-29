import React, { Component } from 'react'
import Web3 from 'web3'
import Token from '../abis/Token.json'
import EthSwap from '../abis/EthSwap.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'
import axios from 'axios';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {BrowserRouter,Routes,Route} from "react-router-dom";
import ArbitrageStatus from './Prices'


const ethers = require("ethers");
var Contract = require('web3-eth-contract');

const { Wallet, providers } = require('ethers');

const HTTPS_PROVIDER_URL = process.env.REACT_APP_HTTPS_PROVIDER;
const WSS_PROVIDER_URL = process.env.REACT_APP_WSS_PROVIDER;
const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;

const webSocketProvider = new Web3.providers.WebsocketProvider(WSS_PROVIDER_URL);
const webSocketWeb3 = new Web3(webSocketProvider);

const jsonRpcProvider = new providers.JsonRpcProvider(HTTPS_PROVIDER_URL);
const wallet = new Wallet(PRIVATE_KEY).connect(jsonRpcProvider);



class App extends Component {


  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    await ArbitrageStatus(jsonRpcProvider, webSocketWeb3, wallet);
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ ethBalance })


    const abi =[{"inputs":[{"internalType":"address","name":"_router","type":"address"},{"internalType":"address","name":"_lusd","type":"address"},{"internalType":"address","name":"_troveManager","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"ethBalance","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_LUSDAmount","type":"uint256"}],"name":"CurrentBalance","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"LUSD","outputs":[{"internalType":"contract ILUSDToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address","name":"_firstRedemptionHint","type":"address"},{"internalType":"address","name":"_upperPartialRedemptionHint","type":"address"},{"internalType":"address","name":"_lowerPartialRedemptionHint","type":"address"},{"internalType":"uint256","name":"_partialRedemptionHintNICR","type":"uint256"},{"internalType":"uint256","name":"_maxIterations","type":"uint256"},{"internalType":"uint256","name":"_maxFee","type":"uint256"}],"name":"ethToLusdAndBackArbitrage","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"getEthBack","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"troveManager","outputs":[{"internalType":"contract ITroveManager","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"uniRouter","outputs":[{"internalType":"contract IUniswapV2Router02","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}];
    
const ADDRESS = "0x12141BF31f4368B335a52C2db360fF5F211b3DA9";
const apikey = "P6WPVB49P938FM14NE196H61MZJXTYA9BU";
const endpoint = "https://api-goerli.etherscan.io/api";

const etherscan = await axios.get(endpoint + `?module=stats&action=tokensupply&contractaddress=${ADDRESS}&apikey=${apikey}`);
const lusdether =axios.get('https://goerli.etherscan.io/address/0x12141BF31f4368B335a52C2db360fF5F211b3DA9#readContract#F3');


// console.log("val");

//lusdether
  //  .then((val) => {
    //    console.log(val);
    //})


    let { result } = etherscan.data;
		this.setState({
		 balance: result,

		});

    const response = await fetch('https://api-goerli.etherscan.io/api?module=contract&action=getabi&address=0x12141BF31f4368B335a52C2db360fF5F211b3DA9&apikey=P6WPVB49P938FM14NE196H61MZJXTYA9BU');
    const data = await response.json();

    let abis = data.result;
    // console.log(abis);

    const node = "https://eth-goerli.public.blastapi.io";
    const provider = new ethers.providers.JsonRpcProvider(node);

    let privatekey = "bc6815496f283c9f1145f04ca58c13846156426c9045b76a326fa8d01f03d9d8";
    let wallet = new ethers.Wallet(privatekey, provider);

    // console.log("Using wallet address " + wallet.address);

    // specifying the deployed contract address 
    let contractaddress = "0x12141BF31f4368B335a52C2db360fF5F211b3DA9";
    
    // initiating a new Contract
   // let contract = new ethers.Contract(contractaddress, abi, wallet);

    //let read = await contract.uniRouter();
    //console.log(read);

 //const web34 = new Web3(Web3.givenProvider || "http://127.0.0.1:7545");
//const contract = new web34.eth.Contract(arbitrageabi, "0x6876b4256c0d6fb772fa171407099BeA2113740B");

//var s= await contract.getvalue()
//console.log(s);
    // Load Token
    const networkId =  await web3.eth.net.getId()
    // const tokenData = Token.networks[networkId]
    // if(tokenData) {
    //   const token = new web3.eth.Contract(Token.abi, tokenData.address)
    //   this.setState({ token })
    //   let tokenBalance = await token.methods.balanceOf(this.state.account).call()
    //   this.setState({ tokenBalance: tokenBalance.toString() })
    // } else {
    //   window.alert('Token contract not deployed to detected network.')
    // }

    // Load EthSwap
    // const ethSwapData = EthSwap.networks[networkId]
    // if(ethSwapData) {
    //   const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address)
    //   this.setState({ ethSwap })
    // } else {
    //   window.alert('EthSwap contract not deployed to detected network.')
    // }

    this.setState({ loading: false })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true })
    //this.state.ethSwap.methods.buyTokens().send({ value: etherAmount, from: this.state.account }).on('transactionHash', (hash) => {
    //  this.setState({ loading: false })
    ///})
    this.setState({ loading: false })
  }

  sellTokens = (tokenAmount) => {
    this.setState({ loading: true })
    this.state.token.methods.approve(this.state.ethSwap.address, tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.ethSwap.methods.sellTokens(tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }


  
  handleClik = () => {
    // 👇️ navigate to /
  //  var navigate = useNavigate()

 //   navigate('/');
  };

  
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      token: {},
      ethSwap: {},
      ethBalance: '0',
      tokenBalance: '0',
      loading: true,
      balance: [],
    }
  }

  

  render() {
    const {balance} = this.state;


    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main
        ethBalance={this.state.ethBalance}
        tokenBalance={this.state.tokenBalance}
        buyTokens={this.buyTokens}
        sellTokens={this.sellTokens}
      />
    }


   

    return (
     
      <div>
       
        <Navbar account={this.state.account} />
        
        <div className="container-fluid mt-5">
          <div className="row">
          
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}

              </div>
            </main>
          </div>
        </div>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {balance}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
