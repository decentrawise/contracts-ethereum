pragma solidity ^0.4.11;

import './lib/token/MintableToken.sol';

contract MN8 is MintableToken {
  string public name = "EMANATE";
  string public symbol = "MN8";
  uint256 public decimals = 18;
}
