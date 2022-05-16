// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Oracle} from "../core/Oracle.sol";
import {PerpVPool} from "../core/PerpVPool.sol";


/*
The MarginPool contract functions as the central clearinghouse for the protocol
-Holds margin balances
-Keeps track of user PnLs
-Pays out PnL at funding periods & settlement

Only accepting USDC as collateral asset for now
*/
contract PerpMarginPool {
    //Mapping of user address to list of contracts, co balances
    mapping(address => Position) public positions;

    mapping(address => uint256) public freeCollateralMap;

    mapping(address => bool) public liquidationRisk; //false=No risk, true=Low risk,

    struct Position {
        int256 amountVPerp;
        int256 fundingPNL;
        uint256 tradedPrice;
        uint256 collateralAmount;
    }

    address public USDCAddress;

    //Current initialization margin rates
    uint256 public marginInit;
    uint256 public marginLowRiskLevel;
    uint256 public marginHighRiskLevel;
    uint256 public marginLiquidationLevel;

    Oracle private oracle;
    PerpVPool private perpVPool;

    constructor(uint256 _initMarginLevel, uint256 _lowRiskMargin, uint256 _highRiskMargin, uint256 _liquidationLevel, address _oracleAddress, address _perpVPoolAddress, address _USDCAddress){
        require(_initMarginLevel > 0, "Rate must be >0");
        require(_lowRiskMargin > 0, "Rate must be >0");
        require(_highRiskMargin > 0, "Rate must be >0");
        require(_liquidationLevel > 0, "Rate must be >0");
        require(_oracleAddress != address(0), "Invalid oracle");
        require(_perpVPoolAddress != address(0), "Invalid oracle");

        marginInit = _initMarginLevel;
        marginLowRiskLevel = _lowRiskMargin;
        marginHighRiskLevel = _highRiskMargin;
        marginLiquidationLevel = _liquidationLevel;

        oracle = Oracle(_oracleAddress);
        perpVPool = PerpVPool(_perpVPoolAddress);

        USDCAddress = _USDCAddress; //Goerli Testnet Address
    }

    //deposit collateral from message sender (user)
    function depositCollateral(uint256 _collateralAmount) public {
        freeCollateralMap[msg.sender] += _collateralAmount;
        ERC20(USDCAddress).transferFrom(msg.sender, address(this), _collateralAmount);
    }

    //return collateral to user
    function returnCollateral(uint256 _collateralAmount) public {
        require(freeCollateralMap[msg.sender] >= _collateralAmount, "Not enough free collateral");

        freeCollateralMap[msg.sender] -= _collateralAmount;
        ERC20(USDCAddress).transfer(msg.sender, _collateralAmount);
    }

    //Create a long position for user
    // for now, require that they can only have one open position at a time
    function openLongPosition(uint256 _amountVPerpUSDC) public {
        require(freeCollateralMap[msg.sender] >= marginInit * _amountVPerpUSDC, "Not enough collateral");
        require(positions[msg.sender].amountVPerp == 0, "Already have open position");

        freeCollateralMap[msg.sender] -= marginInit * _amountVPerpUSDC;
        (uint256 avgPrice, uint256 amountVPerp) = perpVPool.buy(_amountVPerpUSDC);
        positions[msg.sender] = Position(int256(amountVPerp), 0, avgPrice, marginInit * _amountVPerpUSDC);
        liquidationRisk[msg.sender] = false;
    }
    
    //Create short position for user
    function openShortPosition(uint256 _amountVPerpUSDC) public {
        require(freeCollateralMap[msg.sender] >= marginInit * _amountVPerpUSDC, "Not enough collateral");
        require(positions[msg.sender].amountVPerp == 0, "Already have open position");

        freeCollateralMap[msg.sender] -= marginInit * _amountVPerpUSDC;
        (uint256 avgPrice, uint256 amountVPerp) = perpVPool.sell(_amountVPerpUSDC);
        positions[msg.sender] = Position(int256(_amountVPerpUSDC) * -1/int256(avgPrice), 0, avgPrice, marginInit * _amountVPerpUSDC);
        liquidationRisk[msg.sender] = false;
    }

    //Close existing long position for user, for now close whole position
    function closeLongPosition() public{
        require(positions[msg.sender].amountVPerp > 0, "Don't have a long position");

        (uint256 avgPrice, uint256 amountVPerp) = perpVPool.sellAmountVPerp(uint256(positions[msg.sender].amountVPerp));
        freeCollateralMap[msg.sender] += uint256(positions[msg.sender].amountVPerp * int256(avgPrice-positions[msg.sender].tradedPrice) + positions[msg.sender].fundingPNL + int256(positions[msg.sender].collateralAmount));
        
        positions[msg.sender] = Position(0, 0, 0, 0);
        liquidationRisk[msg.sender] = false;
    }

    //Close existing short position for user, for now close whole position
    function closeShortPosition() public {
        require(positions[msg.sender].amountVPerp < 0, "Don't have a short position");

        (uint256 avgPrice, uint256 amountVPerp) = perpVPool.buyAmountVPerp(uint256(positions[msg.sender].amountVPerp));
        freeCollateralMap[msg.sender] += uint256(positions[msg.sender].amountVPerp * int256(positions[msg.sender].tradedPrice-avgPrice) + positions[msg.sender].fundingPNL+ int256(positions[msg.sender].collateralAmount));
        
        positions[msg.sender] = Position(0, 0, 0, 0);
        liquidationRisk[msg.sender] = false;
    }
    
    //Provide liquidity in the USDC/EVIX "Virtual" Pool
    function provideLiquidity(uint256 _amountVPerpUSDC) public {
        freeCollateralMap[msg.sender] -= _amountVPerpUSDC;
        perpVPool.provideLiquidity(msg.sender, _amountVPerpUSDC);
    }

    function removeLiquidity() public {
        uint256 returnedUSDC = perpVPool.removeLiquidity(msg.sender);
        freeCollateralMap[msg.sender] += returnedUSDC;
    }

    function _settleFunding(address _user) internal {
        require(positions[_user].amountVPerp != 0, "No open positions");

        uint256 poolMark = perpVPool.price();
        uint256 indexMark = oracle.spotEVIXLevel();

        positions[_user].fundingPNL += int256(indexMark - poolMark) * positions[_user].amountVPerp;

        _checkCollateralLevel(_user);
    }

    function _checkCollateralLevel(address _user) internal {
        Position memory pos = positions[_user];
        int256 netCollateral = pos.fundingPNL + int256(pos.collateralAmount);
        
        if(netCollateral <= int256(int256(marginLiquidationLevel) * abs(pos.amountVPerp) * int256(perpVPool.price()))){
            _liquidateUserPosition(_user);
        } else if(netCollateral <= int256(int256(marginHighRiskLevel) * abs(pos.amountVPerp) * int256(perpVPool.price()))){
            liquidationRisk[_user] = true;
        } else {
            liquidationRisk[_user] = false;
        }
    }

    function _liquidateUserPosition(address _user) internal {

    }

    function abs(int256 x) private returns (int256) {
        return x>=0 ? x : -x;
    }
}