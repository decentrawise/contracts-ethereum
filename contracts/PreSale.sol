pragma solidity ^0.4.11;

import "./MN8.sol";
import "./lib/crowdsale/TokenCappedCrowdsale.sol";
import "./lib/ownership/Ownable.sol";
import './lib/math/SafeMath.sol';

contract PreSale is TokenCappedCrowdsale, Ownable {
  using SafeMath for uint256;

  bool public isFinalized = false;

  event Finalized();


  function PreSale(address _tokenAddress, uint256 _cap, uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet)
    TokenCappedCrowdsale(_cap)
    Crowdsale(_startTime, _endTime, _rate, _wallet) {

    token = MN8(_tokenAddress);
  }

  // Update token address
  function updateToken(address _tokenAddress) onlyOwner public {
    token = MN8(_tokenAddress);
  }

  // Update the cap
  function updateCap(uint256 _cap) onlyOwner public {
    uint256 supply = token.totalSupply();
    require(_cap >= supply);

    cap = _cap;
  }

  // Update the start time
  function updateStartTime(uint256 _time) onlyOwner public {
    require(_time > now);

    startTime = _time;
  }

  // Update the end time
  function updateEndTime(uint256 _time) onlyOwner public {
    require(_time >= now);

    endTime = _time;
  }

  // Update the rate
  function updateRate(uint256 _rate) onlyOwner public {
    require(_rate > 0);

    rate = _rate;
  }

  // Update wallet address
  function updateWallet(address _walletAddress) onlyOwner public {
    wallet = MN8(_walletAddress);
  }

  // should be called after crowdsale ends, to do
  // some extra finalization work
  function finalize() onlyOwner public {
    require(!isFinalized);
    require(hasEnded());

    finalization();
    Finalized();

    isFinalized = true;
  }

  // end token minting on finalization
  // override this with custom logic if needed
  function finalization() internal {
    startTime = 0;
    endTime = 0;
    cap = 0;
    wallet = address(0);
  }

}
