// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./FlashLoan.sol";
import "./Token.sol";

contract FlashLoanReceiver {
    FlashLoan private pool;
    address private owner;

    event LoanReceived(address tokenAddress, uint256 amount);

    constructor(address _poolAddress) {
        pool = FlashLoan(_poolAddress);
        owner = msg.sender;
    }

    function receiveTokens(address _tokenAddress, uint256 _amount) external {
        require(msg.sender == address(pool), "Not pool");
        console.log("_tokenAddress", _tokenAddress, "amount", _amount);
        console.log(
            "Balance is",
            Token(_tokenAddress).balanceOf(address(this))
        );
        // Require that funds received
        require(
            Token(_tokenAddress).balanceOf(address(this)) >= _amount,
            "Not enough tokens"
        );

        // Emit the event
        emit LoanReceived(_tokenAddress, _amount);

        // Pay back loan
        Token(_tokenAddress).transfer(address(pool), _amount);
    }

    function executeFlashLoan(uint256 _amount) external {
        require(msg.sender == owner, "Not owner");
        pool.flashLoan(_amount);
    }
}
