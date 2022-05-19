// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface ISqueethController{
    //uint128 public normalizationFactor;

    function getExpectedNormalizationFactor() external view returns (uint256);
    function normalizationFactor() external view returns(uint128);
}
