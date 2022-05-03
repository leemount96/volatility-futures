// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Vtoken is ERC20Upgradeable, OwnableUpgradeable {
    uint256 public markPrice;
    uint256 public expiryTimestamp;

    uint256 private constant PRICE_SCALE = 1e8;
    uint256 private constant PRICE_DIGITS = 8;

    function init(
        uint256 _expiry
    ) external initializer {
        markPrice = 0;
        expiryTimestamp = _expiry;

        (string memory tokenName, string memory tokenSymbol) = _getNameAndSymbol(expiryTimestamp);
        __ERC20_init_unchained(tokenName, tokenSymbol);
    }

    function getVtokenDetails() external view returns(
        uint256,
        uint256
    ) {
        return (markPrice, expiryTimestamp);
    }

    function updateMarkPrice(uint256 _newPrice) external onlyOwner {
        markPrice = _newPrice;
    }

    function mintVtoken(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }

    function burnVtoken(address account, uint256 amount) external onlyOwner {
        _burn(account, amount);
    }

    function _getNameAndSymbol(uint256 _expiryTimestamp) private pure returns (string memory, string memory) {
        if (_expiryTimestamp == 1653638400){
            return ("EVOL MAY 2022", "EVK2");
        } else if (_expiryTimestamp == 1656057600){
            return ("EVOL JUN 2022", "EVM2");
        } else {
            revert("No matching expiry");
        }
    }

}