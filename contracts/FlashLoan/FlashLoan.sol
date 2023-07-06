// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IReceiver {
    function receiveTokens(address tokenAddress, uint256 amount) external;
}

contract FlashLoan is ReentrancyGuard {
    Token public token;
    uint256 public poolBalance;

    constructor(address _tokenAddress) {
        token = Token(_tokenAddress);
    }

    function depositTokens(uint256 _amount) external nonReentrant {
        require(token.balanceOf(msg.sender) >= _amount, "Not enough tokens");
        token.transferFrom(msg.sender, address(this), _amount);
        poolBalance = poolBalance + _amount;
    }

    function flashLoan(uint256 _borrowAmount) external nonReentrant {
        require(_borrowAmount > 0, "Must borrow at least 1 token");

        uint256 balanceBefore = token.balanceOf(address(this));
        assert(poolBalance == balanceBefore);
        require(_borrowAmount <= poolBalance, "Not enough tokens in pool");

        //Send tokens to receiver
        token.transfer(msg.sender, _borrowAmount);

        // Use loan and get paid back
        IReceiver(msg.sender).receiveTokens(address(token), _borrowAmount);

        // Ensure that the loan was paid back
        uint256 balanceAfter = token.balanceOf(address(this));
        require(balanceAfter >= balanceBefore, "Must pay back loan");
    }
}
