// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Oracle is Ownable {
    uint256 public spotEVOLLevel;

    constructor(uint256 _initialEVOLLevel){
        spotEVOLLevel = _initialEVOLLevel;
        console.log("Oracle created with initial level %s", spotEVOLLevel);
    }

    function updateSpotLevel(uint256 _newSpotLevel) internal onlyOwner {
        require(_newSpotLevel > 0, "Index must be >0");
        
        console.log("Updating index level from %s to %s", spotEVOLLevel, _newSpotLevel);

        spotEVOLLevel = _newSpotLevel;
    }

    //TODO: Implement getting of settlement price, for now return default of 80%
    function getSettlementPrice(address _vtokenAddress) public returns (uint256) {
        uint256 contractSettlementPrice = uint256(0.8*10**8);
        return contractSettlementPrice;
    }

    //TODO: Implement getting of mark price, for now return default of 85%
    function getIndexMark() public returns (uint256) {
        uint256 contractSettlementPrice = uint256(0.85*10**8);
        return contractSettlementPrice;
    }
}