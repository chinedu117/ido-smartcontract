// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title NAIRA Stable Token
contract NAIRA is ERC20, Ownable {
    constructor(uint256 initialSupply) 
        ERC20("NAIRA Stable Token", "NAIRA")
        Ownable(msg.sender)  // Pass the deployer's address as the initial owner
    {
        _mint(msg.sender, initialSupply);
    }
}
