pragma solidity ^0.4.11;

contract Auth {

    modifier isSender (address _sender) {
        require(_sender == msg.sender);
        _;
    }

}