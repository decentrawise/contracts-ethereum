pragma solidity ^0.4.11;

import "./MN8.sol";
import "./lib/crowdsale/CappedCrowdsale.sol";

contract PreSale is CappedCrowdsale {

  function MyCrowdSale(uint256 _cap, uint256 _startBlock, uint256 _endBlock, uint256 _rate, address _wallet) CappedCrowdsale(_cap) Crowdsale(_startBlock, _endBlock, _rate, _wallet) {
    
  }

}
