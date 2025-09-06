// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title NAIRA Stable Token for MedChain ecosystem
/// @notice Used as payment token to buy MCH in the IDO
contract NAIRA is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("NAIRA Stable Token", "NAIRA") {
        _mint(msg.sender, initialSupply);
    }

    /// @notice Owner can mint new NAIRA tokens (for testing / distribution)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
