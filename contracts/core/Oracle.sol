// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ISqueethController} from "../interfaces/ISqueethController.sol";
import {ABDKMath64x64} from "../libs/ABDKMath64x64.sol";
import "hardhat/console.sol";

contract Oracle {
    uint256 public spotEVIXLevel;
    address public owner;
    address public squeethAddress;

    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can update");
        _;
    }

    constructor(uint256 _initialEVIXLevel, address _squeethAddress){
        spotEVIXLevel = _initialEVIXLevel;
        squeethAddress = _squeethAddress;
        owner = msg.sender;
    }

    function manualUpdateSpotLevel(uint256 _newSpotLevel) public onlyOwner{
        spotEVIXLevel = _newSpotLevel;
    }

    function updateSpotFromSqueeth() public onlyOwner returns(uint256){
        //uint256 expectedNormalization = ISqueethController(squeethAddress).getExpectedNormalizationFactor();
        //uint128 currentNormalization = ISqueethController(squeethAddress).normalizationFactor();
        uint256 expectedNormalization = 667470490629307856;
        uint128 currentNormalization = 668359241497821737;
        uint256 fundingRate = ((currentNormalization - expectedNormalization)*10**18)/currentNormalization;
        //int128 IV = ABDKMath64x64.sqrt(3650/175*fundingRate);
        console.log(fundingRate);
        return fundingRate;
    }
}