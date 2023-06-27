// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './Interfaces/IUniswapV2Router02.sol';
// import './Interfaces/IUniswapV2Pair.sol';
//import './Interfaces/IUniswapV2Factory.sol';
// import './Interfaces/IUniswapV2ERC20.sol';
import './Interfaces/ILUSDToken.sol';
import './Interfaces/ITroveManager.sol';

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";

contract arbitrage {
  
    IUniswapV2Router02 public uniRouter;
    ILUSDToken public LUSD;
    ITroveManager public troveManager;
    address public owner;

    address public lusdaddress;
    address public wethaddress;


    event CurrentBalance(uint256 ethBalance);
    

   // this function runs when the contract is deployed
  constructor(address _router, address _lusd, address _troveManager) public {
    // set initial message
        owner = msg.sender;
        uniRouter = IUniswapV2Router02(_router);
        LUSD = ILUSDToken(_lusd);
        troveManager = ITroveManager(_troveManager);
  }

    fallback() external payable { }
    
    receive() external payable { }

    function return_uniRouter() public view returns (address) {
        return (address(uniRouter));
    }
    function return_lusd() public view returns (address) {
        return (address(LUSD));
    }
    function return_troveManager() public view returns (address) {
        return (address(troveManager));
    }

    function ethtolusd(address lusdadd, address wethadd) public payable {

        lusdaddress = lusdadd;
        wethaddress = wethadd;



    }

   
    
    function ethToLusdAndBackArbitrage(
        uint amountOutMin,
        address _firstRedemptionHint,
        address _upperPartialRedemptionHint,
        address _lowerPartialRedemptionHint,
        uint _partialRedemptionHintNICR,
        uint _maxIterations,
        uint _maxFee
        ) public payable {
        
        emit CurrentBalance(address(this).balance);
        
        
    }
 
    function getEthBack() external payable {
      
    }

}
