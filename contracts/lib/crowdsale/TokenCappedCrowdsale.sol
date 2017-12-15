pragma solidity ^0.4.11;

import '../math/SafeMath.sol';
import './Crowdsale.sol';

/**
 * @title CappedCrowdsale
 * @dev Extension of Crowsdale with a max amount of tokens to be created
 */
contract TokenCappedCrowdsale is Crowdsale {
  using SafeMath for uint256;

  uint256 public cap;
  uint256 public weiMin;
  uint256 public weiMax;

  function TokenCappedCrowdsale(uint256 _cap, uint256 _weiMin, uint256 _weiMax) {
    require(_cap > 0);
    require(_weiMin > 0);
    require(_weiMax > 0);
    require(_weiMax > _weiMin);

    cap = _cap;
    weiMin = _weiMin;
    weiMax = _weiMax;
  }

  // @return true if premium investors can buy at the moment
  function validPremiumPurchase() internal constant returns (bool) {
    uint256 supply = token.totalSupply();
    uint256 weiAmount = msg.value;
    uint256 tokens = weiAmount.mul(rate);

    bool withinCap = (supply.add(tokens) <= cap);

    return super.validPurchase() && withinCap;
  }

  // overriding Crowdsale#validPurchase to add extra cap logic
  // @return true if investors can buy at the moment
  function validPurchase() internal constant returns (bool) {
    uint256 supply = token.totalSupply();
    uint256 weiAmount = msg.value;
    uint256 tokens = weiAmount.mul(rate);

    bool withinCap = (supply.add(tokens) <= cap);
    bool withinBounds = (weiAmount >= weiMin && weiAmount <= weiMax);

    return super.validPurchase() && withinCap && withinBounds;
  }

  // overriding Crowdsale#hasEnded to add cap logic
  // @return true if crowdsale event has ended
  function hasEnded() public constant returns (bool) {
    uint256 supply = token.totalSupply();
    bool capReached = supply >= cap;
    return super.hasEnded() || capReached;
  }

}
