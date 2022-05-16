// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

contract Oracle {
    uint256 public spotEVIXLevel;
    address public owner;

    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can update");
        _;
    }

    constructor(uint256 _initialEVIXLevel){
        spotEVIXLevel = _initialEVIXLevel;
        owner = msg.sender;
    }

    function updateSpotLevel(uint256 _newSpotLevel) public onlyOwner{
        spotEVIXLevel = _newSpotLevel;
    }
}