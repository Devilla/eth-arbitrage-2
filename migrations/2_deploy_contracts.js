const Token = artifacts.require("LUSDToken");
const EthSwap = artifacts.require("EthSwap");

const arbitrage=artifacts.require ("arbitrage");


module.exports = async function(deployer) {

  //deploy arbitrage
  await deployer.deploy(arbitrage, 
    '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a', // Uniswap V2 Router, OLD:'0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
    '0x76ea225E132609D387464e11ce5EFA1764A3799B', // LUSD 
    '0x6412c93AB383B87Af7c5E673fb3a295c8977A3Ed' // TroveManager
   );

  // Deploy Token
  await deployer.deploy(Token,
    '0x6412c93AB383B87Af7c5E673fb3a295c8977A3Ed', // address _troveManagerAddress
    '0x76ea225E132609D387464e11ce5EFA1764A3799B',  // address _stabilityPoolAddress,
     '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a' //address _borrowerOperationsAddress
    );
  const token = await Token.deployed()

  console.log();

  // Deploy EthSwap
  // await deployer.deploy(EthSwap, token.address);
  // const ethSwap = await EthSwap.deployed()

  // Transfer all tokens to EthSwap (1 million)
  await token.transfer('0xFd5143DF522b45732FAa649d378d98510055f515', '1000000000000000000000000')
};
