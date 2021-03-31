// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

import './Interfaces/IUniswapV2Router02.sol';
import './Interfaces/IUniswapV2Pair.sol';
import './Interfaces/IUniswapV2Factory.sol';
import './Interfaces/IUniswapV2ERC20.sol';
import './Interfaces/ILUSDToken.sol';
import './Interfaces/ITroveManager.sol';

contract arbitrage {
    ILUSDToken public LUSD;
    IUniswapV2Router02 public uniRouter;
    ITroveManager public troveManager;
    address public owner;
    
    event CurrentBalance(uint256 ethBalance, uint256 _LUSDAmount);
    
    constructor(address _router,address _lusd, address _troveManager) public {
        owner = msg.sender;
        uniRouter = IUniswapV2Router02(_router);
        LUSD = ILUSDToken(_lusd);
        troveManager = ITroveManager(_troveManager);
    }
    
    fallback() external payable { }
    
    receive() external payable { }
    
    function ethToLusdAndBackArbitrage(
        uint amountOutMin,
        address _firstRedemptionHint,
        address _upperPartialRedemptionHint,
        address _lowerPartialRedemptionHint,
        uint _partialRedemptionHintNICR,
        uint _maxIterations,
        uint _maxFee
        ) external payable {
        
        emit CurrentBalance(address(this).balance, LUSD.balanceOf(address(this)));
        
        // amountOutMin must be retrieved from an oracle of some kind
        address[] memory path = new address[](2);
        path[0] = uniRouter.WETH();
        path[1] = address(LUSD);
        uniRouter.swapExactETHForTokens{ value: msg.value }(amountOutMin, path, address(this), block.timestamp);
        
        emit CurrentBalance(address(this).balance, LUSD.balanceOf(msg.sender));
        
        require(LUSD.approve(address(troveManager), amountOutMin), 'approve failed.');
        
        troveManager.redeemCollateral(
            amountOutMin,
            _firstRedemptionHint,
            _upperPartialRedemptionHint,
            _lowerPartialRedemptionHint,
            _partialRedemptionHintNICR,
            _maxIterations,
            _maxFee
        );
        
        emit CurrentBalance(address(this).balance, LUSD.balanceOf(address(this)));
        
        msg.sender.transfer(address(this).balance);
        LUSD.transfer(msg.sender, LUSD.balanceOf(address(this)));
        
        require(msg.value > address(this).balance, 'arbitrage failed.');
    }
    
    function getEthBack() external payable {
        // Fail safe method incase the contract was used wrong.
        msg.sender.transfer(address(this).balance);
    }
}