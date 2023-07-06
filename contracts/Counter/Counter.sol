// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Counter {
    string public name; // state variable
    uint public count;

    constructor(string memory _name, uint _count) {
        // local variables
        name = _name;
        count = _count;
    }

    // you can write information  into blockchain with paying FEE but reading is out of charge.
    function increment() public returns (uint) {
        count++;
        return count;
    }

    function decrement() public returns (uint) {
        count--;
        return count;
    }

    // VIEW means  you dont pay fees
    function getCount() public view returns (uint) {
        return count;
    }

    function getName() public view returns (string memory) {
        return name;
    }

    function setName(string memory _newName) public returns (string memory) {
        name = _newName;
        return _newName;
    }
}
