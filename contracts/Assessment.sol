// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

//import "hardhat/console.sol";

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event TransferAmount(uint256 amount);
    event TransferOwner(string message);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function transferFund(address payable _to) public payable {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 _transferAmount = msg.value;
        uint _previousBalance = balance;
        if (balance < _transferAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _transferAmount
            });
        }

        (bool success, ) = _to.call{value: _transferAmount}("");
        require(success, "Transfer failed");
        balance -= _transferAmount;

        assert(balance == (_previousBalance - _transferAmount));

        emit TransferAmount(_transferAmount);
    }

    function transferOwner(address payable _newOwner) public {
        require(msg.sender == owner, "You are not the owner of this account");
        owner = _newOwner;

        emit TransferOwner("Ownership successfully transferred.");
    }
}