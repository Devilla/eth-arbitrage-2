// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "./IPriceFeed.sol";


interface ILiquityBase {
    function priceFeed() external view returns (IPriceFeed);
}
