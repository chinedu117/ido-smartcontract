// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title IDO contract that accepts NAIRA (ERC20) and distributes MCH (ERC20)
contract IdoSaleNaira is ReentrancyGuard, Ownable {
    IERC20 public mchToken;
    IERC20 public nairaToken;

    /// tokenPrice = NAIRA (wei) required to buy 1 MCH (wei)
    /// e.g. price = 2.5 * 10**18 means 2.5 NAIRA tokens per 1 MCH token
    uint256 public tokenPrice;

    uint256 public startTime;
    uint256 public endTime;

    // All amounts are expressed in token smallest units (wei) — both tokens assumed 18 decimals
    uint256 public totalTokensForSale;
    uint256 public tokensSold;

    event Bought(address indexed buyer, uint256 nairaAmount, uint256 mchAmount);
    event WithdrawNaira(address indexed owner, uint256 amount);
    event WithdrawUnsoldMCH(address indexed owner, uint256 amount);

    constructor(
        IERC20 _mchToken,
        IERC20 _nairaToken,
        uint256 _tokenPrice,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _totalTokensForSale
    ) Ownable(msg.sender) {
        require(_startTime < _endTime, "invalid times");
        mchToken = _mchToken;
        nairaToken = _nairaToken;
        tokenPrice = _tokenPrice;
        startTime = _startTime;
        endTime = _endTime;
        totalTokensForSale = _totalTokensForSale;
    }

    modifier ongoing() {
        require(block.timestamp >= startTime && block.timestamp <= endTime, "IDO not active");
        _;
    }

    /// @notice Buy MCH using NAIRA tokens. Buyer MUST approve NAIRA to this contract first.
    /// @param nairaAmount Amount of NAIRA (wei) buyer will send (transferFrom)
    function buy(uint256 nairaAmount) external nonReentrant ongoing {
        require(nairaAmount > 0, "nairaAmount > 0");

        // Calculate mchAmount (in MCH wei):
        // mchAmount = (nairaAmount * 1e18) / tokenPrice
        // Explanation: tokenPrice is NAIRA wei per 1 MCH (wei).
        uint256 mchAmount = (nairaAmount * (10**18)) / tokenPrice;
        require(mchAmount > 0, "naira amount too small for 1 MCH unit");
        require(tokensSold + mchAmount <= totalTokensForSale, "Not enough MCH left");

        tokensSold += mchAmount;

        // Transfer NAIRA from buyer to IDO contract
        bool ok = nairaToken.transferFrom(msg.sender, address(this), nairaAmount);
        require(ok, "NAIRA transfer failed");

        // Transfer MCH tokens to buyer
        ok = mchToken.transfer(msg.sender, mchAmount);
        require(ok, "MCH transfer failed");

        emit Bought(msg.sender, nairaAmount, mchAmount);
    }

    /// @notice Owner withdraws collected NAIRA tokens
    function withdrawNaira() external onlyOwner {
        uint256 bal = nairaToken.balanceOf(address(this));
        require(bal > 0, "No NAIRA");
        nairaToken.transfer(owner(), bal);
        emit WithdrawNaira(owner(), bal);
    }

    /// @notice Owner withdraws unsold MCH after IDO ends
    function withdrawUnsoldMCH() external onlyOwner {
        require(block.timestamp > endTime, "IDO not ended");
        uint256 unsold = totalTokensForSale - tokensSold;
        if (unsold > 0) {
            mchToken.transfer(owner(), unsold);
            emit WithdrawUnsoldMCH(owner(), unsold);
        }
    }

    /// @notice Emergency: get MCH balance at contract (view)
    function mchBalance() external view returns (uint256) {
        return mchToken.balanceOf(address(this));
    }

    /// @notice Emergency: get NAIRA balance at contract (view)
    function nairaBalance() external view returns (uint256) {
        return nairaToken.balanceOf(address(this));
    }
}
