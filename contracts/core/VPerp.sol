// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract VPerp is ERC20Upgradeable, OwnableUpgradeable {
    address public marginPool;
    address private immutable deployer;

    modifier onlyMarginPool() {
        require(msg.sender == marginPool, "Not controller");
        _;
    }

    constructor() {
        deployer = msg.sender;
    }

    function init(address _marginPool) external initializer {
        marginPool = _marginPool;
        __ERC20_init_unchained("VToken Perp", "pEVOL");
    }

    function mintVtoken(address account, uint256 amount) external onlyMarginPool {
        _mint(account, amount);
    }

    function burnVtoken(address account, uint256 amount) external onlyMarginPool {
        _burn(account, amount);
    }
}