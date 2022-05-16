// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract PerpVPool{
    uint256 public price;
    uint256 public poolUSDC;
    uint256 public poolVPerp;

    address public tUSDCAddress;

    event TradedVPerp(uint256 price, int256 amount);
    
    mapping(address => LPPosition) internal positions;

    struct LPPosition {
        uint256 amountUSDC;
        uint256 amountVPerp;
        uint256 initPrice;
    }

    constructor(uint256 _initPrice, address USDCAddress){
        price = _initPrice;
        poolUSDC = 0;
        poolVPerp = 0;

        tUSDCAddress = USDCAddress;
    }
    
    function provideLiquidity(address _user, uint256 _amountUSDC) public {
        require(positions[_user].amountUSDC == 0 && positions[_user].amountVPerp == 0, "User has position already");
        require(ERC20Upgradeable(tUSDCAddress).balanceOf(_user) >= _amountUSDC, "Not enough USDC in wallet");

        ERC20Upgradeable(tUSDCAddress).transferFrom(_user, address(this), _amountUSDC);

        poolUSDC += _amountUSDC;
        poolVPerp += _amountUSDC/price;

        positions[_user] = LPPosition(_amountUSDC, _amountUSDC/price, price);
    }

    function removeLiquidity(address _user) public returns (uint256) {

    }

    function buy(uint256 _amountUSDC) public returns (uint256, uint256){
        require(poolVPerp * price > _amountUSDC, "not enough liquidity");
        require(ERC20Upgradeable(tUSDCAddress).balanceOf(msg.sender) >= _amountUSDC, "not enough USDC in wallet");

        uint256 k = poolUSDC * poolVPerp;
        uint256 newPerpAmount = k/(poolUSDC + _amountUSDC);
        uint256 perpTraded = poolVPerp - newPerpAmount;

        ERC20Upgradeable(tUSDCAddress).transferFrom(msg.sender, address(this), _amountUSDC);

        poolUSDC += _amountUSDC;
        poolVPerp -= perpTraded;
        price = poolUSDC/poolVPerp;

        emit TradedVPerp(_amountUSDC/perpTraded, int256(perpTraded));

        return (_amountUSDC/perpTraded, perpTraded);
    }

    function sell(uint256 _amountUSDC) public returns (uint256, uint256){
        // TODO
    }

    function buyAmountVPerp(uint256 _amountVPerp) public returns (uint256, uint256) {
        require(poolVPerp > _amountVPerp, "not enough liquidity");
        require(ERC20Upgradeable(tUSDCAddress).balanceOf(msg.sender) >= _amountVPerp * price, "not enough USDC in wallet");

        uint256 k = poolUSDC * poolVPerp;
        uint256 newPerpAmount = poolVPerp - _amountVPerp;
        uint256 newUSDCAmount = k / newPerpAmount;

        ERC20Upgradeable(tUSDCAddress).transferFrom(msg.sender, address(this), newUSDCAmount - poolUSDC);
        
        uint256 tradedPrice = (newUSDCAmount - poolUSDC)/_amountVPerp;

        poolUSDC = newUSDCAmount;
        poolVPerp = newPerpAmount;
        price = poolUSDC/poolVPerp;

        emit TradedVPerp(tradedPrice, int256(_amountVPerp));

        return (tradedPrice, _amountVPerp);
    }

    function sellAmountVPerp(int256 _amountVPerp) public returns (uint256, uint256) {
        // TODO
    }
}