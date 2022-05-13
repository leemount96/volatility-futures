// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

contract PerpVPool{
    uint256 price = 80;

    function getCurrentPrice() public returns (uint256){
        return price;
    }

    function buy(uint256 _amount) public returns (uint256){

    }

    function sell(uint256 _amount) public returns (uint256){

    }

    function buyAmountVPerp(int256 _amount) public returns (uint256) {

    }
    function sellAmountVPerp(int256 _amount) public returns (uint256) {
        
    }

    function getMark() public returns (uint256) {

    }
}