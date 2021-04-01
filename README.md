# liquity-arbitrage

This project will perform an arbitrage of LUSD/ETH pair. This will be done by 2 steps
1. Swap ETH for LUSD at uniswap 
2. Redeem LUSD for ETH at liquity

# Design

The project has two main components , one is the node server and another is the smart contract. 

The node server is responsible for keeping a track of the prices of ETH at chainlink and at uniswap. When we notice a price difference where there is a possiblity of a profit from arbitrage it will trigger the smart contract to perform the arbitrage between uniswap and liquity smart contracts.

### How is the amount of eth to be used for the arbitrage calculated ?

We have three restrictions in determining the ETH that can be used for the arbitrage. 
1) The ETH present in the arbitragers wallet
2) The redeemable amount at liquity 
3) The uniswap reserves in the LUSD/ETH pair

We will first take the minimum of 
```
min( <ETH present in Wallet> , <12.5% of the reserve pool of uniswap pair> )  // We will not use a bigger percentage of the uniswap pool because it will impact the prices heavily
```
Once the minimum is determined we will then check at liquity if we can redeem LUSD the amount of ETH swapped. If not , we will use the redeemableLUSD at liquity to determine the ETH used for swap.

######Note: The smaller the percent of the uniswap pool we can use the better prices we can get, I have taken 12.5% of the pool for now because the pool reserves are small.

### How will it determine if there is an arbitrage opportunity ?

We can determine the arbitrage opportunity by the following formula.
```
profit = ETH_USED * (uniswapPrice/chainLinkPrice) * (1-redemptionFeePercentage) * (1-uinswap_liquidity_provider_fee) - GasCost
```

If we find that the profit is positive we will then invoke the smart contract.

### What mechanism will be used to make sure the server can be run 24/7 ?

To run the server 24/7 we will need a poller mechanism which will continously monitor the prices. To do this , this project will subscribe to the new block headers generated in the ethereum chain. This is done considering uniswap prices are updated after every block is mined.

# How to start

Run the following commands
```
> yarn
> cp node_modules/@liquity/lib-ethers/deployments/default/kovan.json node_modules/@liquity/lib-ethers/dist/deployments/dev.json 
```

After this add your private keys and wallet addresses to .env file.

#### To start the server:
```
yarn start
```
Once the server is started you will need to ping `localhost:3000/subscribe` to start polling for prices. Without subscribing to events , the arbitrage bot will not work.

You can unsubscribe from the ethereum events by hitting `localhost:3000/unsubscribe`.

#### Sample `.env` file
```
PRIVATE_KEY='PVT_KEY_FROM_WALLET'
WSS_PROVIDER='wss://kovan.infura.io/ws/v3/API_KEY'
HTTPS_PROVIDER='https://kovan.infura.io/v3/API_KEY'
ACCOUNT_ADDRESS='WALLET_ADDRESS_OF_THE_PRIVATE_KEY'
```

# Testing 

Tested by creating a price difference in uniswap and chainlink 

* [Converted 0.778 ETH to 0.833 ETH](https://kovan.etherscan.io/tx/0xe71c1f51a90a39088073e8b66a9880e1b2c766046c95e3aa3e1814eca7a3b527) ( 0.778 was choosen based on the wallet balance )
* [Converted 1.01 eth to 1.05 eth & 900(wei) LUSD](https://kovan.etherscan.io/tx/0xc544d95f30b02e606f33d08c394b73ed1832d278e813fdde93236f6aaf8fd755) (1.01 eth was choosen based on the uniswap pool reserve )
* [Converted 0.771 eth to 1.08 eth & 1860(wei) LUSD](https://kovan.etherscan.io/tx/0xe80ed8aea2f845dfcf9eb30ea834ffc6fb61f1b5bccbcfbdc217ea9dc761f45f)
* [Converted 0.863 eth to 0.94 eth & 324(wei) LUSD](https://kovan.etherscan.io/tx/0xd226660d149e239d748e4ad87d41654d5a96f03eb2a2aab25381c39aea548fb7)
