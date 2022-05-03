// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {Vtoken} from "../core/Vtoken.sol";
import {Oracle} from "../core/Oracle.sol";


/*
The MarginPool contract functions as the central clearinghouse for the protocol
-Holds margin balances
-Keeps track of user PnLs
-Pays out PnL at funding periods & settlement
-Settles trades
*/
contract MarginPool is Ownable {
    //Mapping representing a list of current active contracts
    mapping(address => bool) internal contractList;
    //Mapping representing collateral asset balances
    mapping(address => uint256) internal assetBalance;
    //Mapping of user address to list of contracts, co balances
    mapping(address => mapping(address => Position)) internal longPositions;
    mapping(address => mapping(address => Position)) internal shortPositions;

    struct Position {
        uint256 amountVtoken;
        address collateralAsset;
        uint256 amountCollateral;
        uint256 realizedPnL;
    }
    
    address[] internal longHolders;
    address[] internal shortHolders;

    //Current initialization margin rates
    uint256 public longMarginInit;
    uint256 public longMarginMaintenance;
    uint256 public shortMarginInit;
    uint256 public shortMarginMaintenance;

    Oracle private oracle;

    constructor(uint256 _longRate, uint256 _shortRate, address _oracleAddress){
        require(_longRate > 0, "Rate must be >0");
        require(_shortRate > 0, "Rate must be >0");
        require(_oracleAddress != address(0), "Invalid oracle");

        longMarginInit = _longRate;
        longMarginMaintenance = _longRate;
        shortMarginInit = _shortRate;
        shortMarginMaintenance = _shortRate;
        oracle = Oracle(_oracleAddress);
    }

    //Mint a long Vtoken to the account of the user
    function mintLongToken(address _user, address _vtoken, uint256 _amountVtoken, address _collateralAsset, uint256 _collateralAmount) public onlyOwner{
        require(_collateralAmount >= longMarginInit * _amountVtoken, "Not enough collateral");
        require(contractList[_vtoken], "Contract not allowed");
        
        transferToPool(_user, _collateralAsset, _collateralAmount);
        
        Vtoken vtoken = Vtoken(_vtoken);
        vtoken.mintVtoken(_user, _amountVtoken);

        longPositions[_user][_vtoken] = Position(_amountVtoken, _collateralAsset, _collateralAmount, 0);

        longHolders.push(_user);
    }

    function mintShortToken(address _user, address _vtoken, uint256 _amountVtoken, address _collateralAsset, uint256 _collateralAmount) public onlyOwner{
        require(_collateralAmount >= shortMarginInit * _amountVtoken, "Not enough collateral");
        require(contractList[_vtoken], "Contract not allowed");
        
        transferToPool(_user, _collateralAsset, _collateralAmount);
        //TODO: Short VToken Representation
        shortPositions[_user][_vtoken] = Position(_amountVtoken, _collateralAsset, _collateralAmount, 0);

        shortHolders.push(_user);
    }

    function transferToPool(address _user, address _asset, uint256 _amount) public onlyOwner{
        assetBalance[_asset] += _amount;
        ERC20Upgradeable(_asset).transferFrom(_user, address(this), _amount);
    }

    function setLongMarginRate(uint256 _newLongRate) internal onlyOwner{
        longMarginInit = _newLongRate;
        longMarginMaintenance = _newLongRate;
    }

    function setShortMarginRate(uint256 _newShortRate) internal onlyOwner{
        shortMarginInit = _newShortRate;
        shortMarginMaintenance = _newShortRate;
    }

    function periodSettlement(address _vtoken) internal onlyOwner{
        Vtoken vtoken = Vtoken(_vtoken);
        uint256 markPrice = vtoken.markPrice();

        uint256 periodSettlementPrice = _getTodaySettlement(_vtoken);

        uint256 settlementAmount = periodSettlementPrice - markPrice;

        if(settlementAmount > 0){
            //TODO: increment long holder PnL, decrement short holder PnL
            for(uint i = 0; i < longHolders.length; i++) {
                
            }
        } else {
            //TODO: make payment from longs to shorts, check if any below maintenance rate
        }
    }
    
    //initialize contract and add Vtoken to valid contracts list
    function initializeContract(uint256 _expiry) internal onlyOwner {
        Vtoken newContract = new Vtoken();
        newContract.init(_expiry); //need to check this is the right syntax
        contractList[address(newContract)] = true;
    }

    //TODO: Add oracle to get index settlement value
    function _getTodaySettlement(address _vtoken) internal onlyOwner returns(uint256){
        uint256 contractSettlementLevel = oracle.getSettlementPrice(_vtoken);

        return contractSettlementLevel;
    }
}