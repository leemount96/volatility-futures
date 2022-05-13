// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {VPerp} from "../core/VPerp.sol";
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
    mapping(address => Position) internal positions;

    mapping(address => uint256) internal freeCollateralMap;

    mapping(address => uint8) internal liquidationRisk; //0=No risk, 1=Low risk, 2=High risk, 3=To be liquidated

    struct Position {
        int256 amountVPerp;
        int256 fundingPNL;
        uint256 tradedPrice;
        uint256 collateralAmount;
    }

    address public tUSDCAddress;

    //Current initialization margin rates
    uint256 public longMarginInit;
    uint256 public longMarginLowRiskLevel;
    uint256 public longMarginHighRiskLevel;
    uint256 public longMarginLiquidationLevel;

    uint256 public shortMarginInit;
    uint256 public shortMarginLowRiskLevel;
    uint256 public shortMarginHighRiskLevel;
    uint256 public shortMarginLiquidationLevel;

    Oracle private oracle;
    PerpVPool private perpVPool;

    constructor(uint256 _initMarginLevel, uint256 _lowRiskMargin, uint256 _highRiskMargin, uint256 _liquidationLevel, address _oracleAddress, address _perpVPoolAddress){
        require(_initMarginLevel > 0, "Rate must be >0");
        require(_lowRiskMargin > 0, "Rate must be >0");
        require(_highRiskMargin > 0, "Rate must be >0");
        require(_liquidationLevel > 0, "Rate must be >0");
        require(_oracleAddress != address(0), "Invalid oracle");
        require(_perpVPoolAddress != address(0), "Invalid oracle");

        longMarginInit = _initMarginLevel;
        longMarginLowRiskLevel = _lowRiskMargin;
        longMarginHighRiskLevel = _highRiskMargin;
        longMarginLiquidationLevel = _liquidationLevel;
        shortMarginInit = _initMarginLevel;
        shortMarginLowRiskLevel = _lowRiskMargin;
        shortMarginHighRiskLevel = _highRiskMargin;
        shortMarginLiquidationLevel = _liquidationLevel;

        oracle = Oracle(_oracleAddress);
        perpVPool = PerpVPool(_perpVPoolAddress);

        tUSDCAddress = 0x07865c6E87B9F70255377e024ace6630C1Eaa37F; //Goerli Testnet Address
    }

    //deposit collateral from message sender (user)
    function depositCollateral(uint256 _collateralAmount) public {
        freeCollateralMap[msg.sender] += _collateralAmount;
        ERC20Upgradeable(tUSDCAddress).transferFrom(msg.sender, address(this), _collateralAmount);
    }

    //return collateral to user
    function returnCollateral(uint256 _collateralAmount) public {
        require(freeCollateralMap[msg.sender] >= _collateralAmount, "Not enough free collateral");

        freeCollateralMap[msg.sender] -= _collateralAmount;
        ERC20Upgradeable(tUSDCAddress).transferFrom(address(this), msg.sender, _collateralAmount);
    }

    //Create a long position for user
    // for now, require that they can only have one open position at a time
    function openLongPosition(uint256 _amountVPerpUSDC) public {
        require(freeCollateralMap[msg.sender] >= longMarginInit * _amountVPerpUSDC, "Not enough collateral");
        require(positions[msg.sender].amountVPerp == 0, "Already have open position");

        freeCollateralMap[msg.sender] -= longMarginInit * _amountVPerpUSDC;
        uint256 avgPrice = perpVPool.buy(_amountVPerpUSDC);
        positions[msg.sender] = Position(int256(_amountVPerpUSDC/avgPrice), 0, avgPrice, longMarginInit * _amountVPerpUSDC);
        liquidationRisk[msg.sender] = 0;
    }
    
    //Create short position for user
    function openShortPosition(uint256 _amountVPerpUSDC) public {
        require(freeCollateralMap[msg.sender] >= shortMarginInit * _amountVPerpUSDC, "Not enough collateral");
        require(positions[msg.sender].amountVPerp == 0, "Already have open position");

        freeCollateralMap[msg.sender] -= shortMarginInit * _amountVPerpUSDC;
        uint256 avgPrice = perpVPool.sell(_amountVPerpUSDC);
        positions[msg.sender] = Position(int256(_amountVPerpUSDC) * -1/int256(avgPrice), 0, avgPrice, shortMarginInit * _amountVPerpUSDC);
        liquidationRisk[msg.sender] = 0;
    }

    //Close existing long position for user, for now close whole position
    function closeLongPosition() public{
        require(positions[msg.sender].amountVPerp > 0, "Don't have a long position");

        uint256 avgPrice = perpVPool.sellAmountVPerp(positions[msg.sender].amountVPerp);
        freeCollateralMap[msg.sender] += uint256(positions[msg.sender].amountVPerp * int256(avgPrice-positions[msg.sender].tradedPrice) + positions[msg.sender].fundingPNL + int256(positions[msg.sender].collateralAmount));
        
        positions[msg.sender] = Position(0, 0, 0, 0);
        liquidationRisk[msg.sender] = 0;
    }

    //Close existing short position for user, for now close whole position
    function closeShortPosition() public {
        require(positions[msg.sender].amountVPerp < 0, "Don't have a short position");

        uint256 avgPrice = perpVPool.buyAmountVPerp(positions[msg.sender].amountVPerp);
        freeCollateralMap[msg.sender] += uint256(positions[msg.sender].amountVPerp * int256(positions[msg.sender].tradedPrice-avgPrice) + positions[msg.sender].fundingPNL+ int256(positions[msg.sender].collateralAmount));
        
        positions[msg.sender] = Position(0, 0, 0, 0);
        liquidationRisk[msg.sender] = 0;
    }
    
    //Provide liquidity in the USDC/EVIX "Virtual" Uni V3 Pool
    function provideLiquidity(uint256 _lowPrice, uint256 _highPrice, uint256 _amountVPerpUSDC) public {
        
    }

    function _settleFunding(address _user) internal {
        require(positions[_user].amountVPerp != 0, "No open positions");

        uint256 poolMark = perpVPool.getMark();
        uint256 indexMark = oracle.getIndexMark();

        positions[_user].fundingPNL += int256(indexMark - poolMark) * positions[_user].amountVPerp;

        _checkCollateralLevel(_user);
    }

    function _checkCollateralLevel(address _user) internal {
        Position memory pos = positions[_user];
        uint256 currentCollateral = pos.collateralAmount;
    }
}