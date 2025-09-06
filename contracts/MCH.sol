// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MedChain Token (MCH)
contract MCH is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("MedChain Token", "MCH") {
        _mint(msg.sender, initialSupply);
    }

    /// @notice Owner can mint additional MCH if required
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
