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

    struct Position {
        int256 amountVPerp;
        int256 fundingPNL;
        uint256 tradedPrice;
    }

    address public tUSDCAddress;

    //Current initialization margin rates
    uint256 public longMarginInit;
    uint256 public longMarginMaintenance;
    uint256 public shortMarginInit;
    uint256 public shortMarginMaintenance;

    Oracle private oracle;
    PerpVPool private perpVPool;

    constructor(uint256 _longRate, uint256 _shortRate, address _oracleAddress, address _perpVPoolAddress){
        require(_longRate > 0, "Rate must be >0");
        require(_shortRate > 0, "Rate must be >0");
        require(_oracleAddress != address(0), "Invalid oracle");
        require(_perpVPoolAddress != address(0), "Invalid oracle");

        longMarginInit = _longRate;
        longMarginMaintenance = _longRate;
        shortMarginInit = _shortRate;
        shortMarginMaintenance = _shortRate;

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
        positions[msg.sender] = Position(int256(_amountVPerpUSDC/avgPrice), 0, avgPrice);
    }
    
    //Create short position for user
    function openShortPosition(uint256 _amountVPerp) public {
        require(freeCollateralMap[msg.sender] >= shortMarginInit * _amountVPerp, "Not enough collateral");
        require(positions[msg.sender].amountVPerp == 0, "Already have open position");

        freeCollateralMap[msg.sender] -= shortMarginInit * _amountVPerp;
        uint256 avgPrice = perpVPool.sell(_amountVPerp);
        positions[msg.sender] = Position(int256(_amountVPerp) * -1/int256(avgPrice), 0, avgPrice);
    }

    //Close existing long position for user, for now close whole position
    function closeLongPosition() public{
        require(positions[msg.sender].amountVPerp > 0, "Don't have a long position");

        uint256 avgPrice = perpVPool.sellAmountVPerp(positions[msg.sender].amountVPerp);
        freeCollateralMap[msg.sender] += uint256(positions[msg.sender].amountVPerp * int256(avgPrice-positions[msg.sender].tradedPrice) + positions[msg.sender].fundingPNL);
        
        positions[msg.sender] = Position(0, 0, 0);
    }

    //Close existing short position for user, for now close whole position
    function closeShortPosition() public {
        require(positions[msg.sender].amountVPerp < 0, "Don't have a short position");

        uint256 avgPrice = perpVPool.buyAmountVPerp(positions[msg.sender].amountVPerp);
        freeCollateralMap[msg.sender] += uint256(positions[msg.sender].amountVPerp * int256(positions[msg.sender].tradedPrice-avgPrice) + positions[msg.sender].fundingPNL);
        
        positions[msg.sender] = Position(0, 0, 0);
    }

    function setLongMarginRate(uint256 _newLongRate) internal {
        longMarginInit = _newLongRate;
        longMarginMaintenance = _newLongRate;
    }

    function setShortMarginRate(uint256 _newShortRate) internal {
        shortMarginInit = _newShortRate;
        shortMarginMaintenance = _newShortRate;
    }

    function settleFunding(address _user) internal {
        require(positions[_user].amountVPerp != 0, "No open positions");

        uint256 poolMark = perpVPool.getMark();
        uint256 indexMark = oracle.getIndexMark();

        positions[_user].fundingPNL += int256(indexMark - poolMark) * positions[_user].amountVPerp;
    }
}