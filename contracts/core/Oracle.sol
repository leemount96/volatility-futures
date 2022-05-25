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

    function manualUpdateSpotLevel(uint256 _newSpotLevel) public{
        spotEVIXLevel = _newSpotLevel;
    }

    function updateSpotFromSqueeth(uint128 _currentNormalization, uint256 _expectedNormalization) public{
        int256 expectedNormalization = int256(ISqueethController(squeethAddress).getExpectedNormalizationFactor());
        int128 currentNormalization = int128(ISqueethController(squeethAddress).normalizationFactor());

        // int256 expectedNormalization = int256(_expectedNormalization);
        // int128 currentNormalization = int128(_currentNormalization);

        int128 expectedNormalization128 = ABDKMath64x64.fromInt(expectedNormalization);
        currentNormalization = ABDKMath64x64.fromInt(currentNormalization);
        int128 timeFactor = ABDKMath64x64.fromInt(4566962103755937000);

        int128 fundingRate = abs(ABDKMath64x64.div(currentNormalization - expectedNormalization128, currentNormalization));
        int128 IV = ABDKMath64x64.mul(ABDKMath64x64.sqrt(fundingRate), timeFactor);

        spotEVIXLevel = uint256(ABDKMath64x64.toUInt(IV))/10**13;
    }

    function abs(int128 x) private pure returns (int128) {
        return x>=0 ? x : -x;
    }
}