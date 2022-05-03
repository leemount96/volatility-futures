// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {VPerp} from "../core/VPerp.sol";
import {Oracle} from "../core/Oracle.sol";


/*
The MarginPool contract functions as the central clearinghouse for the protocol
-Holds margin balances
-Keeps track of user PnLs
-Pays out PnL at funding periods & settlement

Only accepting USDC as collateral asset for now
*/
contract PerpMarginPool is Ownable {
    //Mapping of user address to list of contracts, co balances
    mapping(address => Position) internal longPositions;
    mapping(address => Position) internal shortPositions;

    struct Position {
        int256 amountVPerp;
        uint256 amountCollateral;
        int256 realizedPnL;
        uint256 holderNumber;
    }
    
    address[] internal longHolders;
    address[] internal shortHolders;

    address public tUSDCAddress;
    address public vPerpAddress;

    //Current initialization margin rates
    uint256 public longMarginInit;
    uint256 public longMarginMaintenance;
    uint256 public shortMarginInit;
    uint256 public shortMarginMaintenance;

    Oracle private oracle;

    constructor(uint256 _longRate, uint256 _shortRate, address _oracleAddress, address _vperpAddress){
        require(_longRate > 0, "Rate must be >0");
        require(_shortRate > 0, "Rate must be >0");
        require(_oracleAddress != address(0), "Invalid oracle");

        longMarginInit = _longRate;
        longMarginMaintenance = _longRate;
        shortMarginInit = _shortRate;
        shortMarginMaintenance = _shortRate;
        oracle = Oracle(_oracleAddress);

        tUSDCAddress = 0x07865c6E87B9F70255377e024ace6630C1Eaa37F; //Goerli Testnet Address
        vPerpAddress = _vperpAddress;
        VPerp perp = VPerp(vPerpAddress);
        perp.init(address(this));
    }

    //Create a long position for user
    function createLongPosition(address _user, uint256 _amountVPerp, uint256 _collateralAmount) public onlyOwner{
        require(_collateralAmount >= longMarginInit * _amountVPerp, "Not enough collateral");
        
        _transferToPool(_user, _collateralAmount);
        
        VPerp vperp = VPerp(vPerpAddress);
        vperp.mintVtoken(_user, _amountVPerp);

        longPositions[_user] = Position(int256(_amountVPerp), _collateralAmount, 0, longHolders.length);

        longHolders.push(_user);
    }
    
    //create short position for user
    function createShortPosition(address _user, uint256 _amountVPerp, uint256 _collateralAmount) public onlyOwner{
        require(_collateralAmount >= shortMarginInit * _amountVPerp, "Not enough collateral");
        
        _transferToPool(_user, _collateralAmount);
        //TODO: Short VToken Representation
        int256 intPerpAmount = int256(_amountVPerp);

        shortPositions[_user] = Position(-1*intPerpAmount, _collateralAmount, 0, shortHolders.length);

        shortHolders.push(_user);
    }

    //For now, redeem full position
    function redeemPosition(address _user, uint256 _amountVPerp, bool isLong) public onlyOwner {
        Position storage pos;

        if(isLong){
            pos = longPositions[_user];
        } else {
            pos = shortPositions[_user];
        }
        
        require(int256(_amountVPerp) == pos.amountVPerp, "Must redeem less than holdings");

        uint256 transferAmount = uint256(int256(pos.amountCollateral) + pos.realizedPnL);

        _transferToUser(_user, transferAmount);

        pos.amountVPerp = 0;
        pos.amountCollateral = 0;
        pos.realizedPnL = 0;

        if(isLong){
            delete longHolders[pos.holderNumber];
        } else {
            delete shortHolders[pos.holderNumber];
        }
    }

    function _transferToPool(address _user, uint256 _amount) public onlyOwner{
        ERC20Upgradeable(tUSDCAddress).transferFrom(_user, address(this), _amount);
    }

    function _transferToUser(address _user, uint256 _amount) public onlyOwner{
        ERC20Upgradeable(tUSDCAddress).transferFrom(address(this), _user, _amount);
    }

    function setLongMarginRate(uint256 _newLongRate) internal onlyOwner{
        longMarginInit = _newLongRate;
        longMarginMaintenance = _newLongRate;
    }

    function setShortMarginRate(uint256 _newShortRate) internal onlyOwner{
        shortMarginInit = _newShortRate;
        shortMarginMaintenance = _newShortRate;
    }

    function periodSettlement() internal onlyOwner{
        uint256 markPrice = _getMarkPrice();
        uint256 periodSettlementPrice = _getTodaySettlement();

        int256 settlementAmount = int256(periodSettlementPrice) - int256(markPrice);

        for(uint256 i = 0; i < longHolders.length; i++){
            Position storage pos = longPositions[longHolders[i]];

            if(pos.amountVPerp == 0){
                continue;
            }

            pos.realizedPnL += pos.amountVPerp * settlementAmount; 
            if(int(pos.amountCollateral) + pos.realizedPnL < int(longMarginMaintenance) * pos.amountVPerp){
                _sendLiquidationWarning(longHolders[i], true);
            }
        }

        for(uint256 i = 0; i < shortHolders.length; i++){
            Position storage pos = shortPositions[shortHolders[i]];
            
            if(pos.amountVPerp == 0){
                continue;
            }

            pos.realizedPnL += pos.amountVPerp * settlementAmount; 
            if(int(pos.amountCollateral) + pos.realizedPnL < int(longMarginMaintenance) * pos.amountVPerp){
                _sendLiquidationWarning(shortHolders[i], false);
            }
        }
    }
    
    function _getTodaySettlement() internal onlyOwner returns(uint256){
        uint256 vPerpSettlementLevel = oracle.getSettlementPrice(vPerpAddress);

        return vPerpSettlementLevel;
    }

    function _getMarkPrice() internal onlyOwner returns(uint256){
        uint256 vPerpMark = oracle.getMarkPrice(vPerpAddress);

        return vPerpMark;
    }

    function _sendLiquidationWarning(address holder, bool isLong) internal onlyOwner {

    }
}