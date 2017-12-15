pragma solidity ^0.4.11;


/*import './StandardToken.sol';*/
import './UpgradeableToken.sol';
import './LimitedTransferToken.sol';
import '../ownership/Ownable.sol';



/**
 * @title Mintable token
 * @dev Simple ERC20 Token example, with mintable token creation
 * @dev Issue: * https://github.com/OpenZeppelin/zeppelin-solidity/issues/120
 * Based on code by TokenMarketNet: https://github.com/TokenMarketNet/ico/blob/master/contracts/MintableToken.sol
 */

contract MintableToken is UpgradeableToken, LimitedTransferToken, Ownable {
  event MintingAgentChanged(address indexed addr, bool state);
  event Mint(address indexed to, uint256 amount);
  event MintFinished();

  /** List of agents that are allowed to create new tokens */
  mapping (address => bool) public mintAgents;

  bool public mintingFinished = false;


  modifier onlyMintAgent() {
    // Only crowdsale contracts are allowed to mint new tokens
    require(mintAgents[msg.sender]);
    _;
  }

  modifier canMint() {
    require(!mintingFinished);
    _;
  }

  function MintableToken() UpgradeableToken(msg.sender) public { }

  /**
   * Owner can allow crowdsale contracts to mint new tokens.
   */
  function setMintAgent(address _addr, bool _state) onlyOwner canMint public {
    mintAgents[_addr] = _state;
    MintingAgentChanged(_addr, _state);
  }

  /**
   * @dev Function to mint tokens
   * @param _to The address that will recieve the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(address _to, uint256 _amount) onlyMintAgent canMint public returns (bool) {
    totalSupply = totalSupply.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    Mint(_to, _amount);
    return true;
  }

  /**
   * @dev Function to stop minting new tokens.
   * @return True if the operation was successful.
   */
  function finishMinting() onlyOwner public returns (bool) {
    mintingFinished = true;
    MintFinished();
    return true;
  }

  // overriding UpgradeableToken#canUpgrade to define when to upgrade logic
  // @return true if token can be upgraded at the moment
  function canUpgrade() public view returns(bool) {
    return mintingFinished;
  }

  // overriding LimitedTransferToken#transferableTokens to only allow transfer after minting is finished
  // @dev Overwriting transferableTokens(address holder, uint64 time) is the way to provide the
  // specific logic for limiting token transferability for a holder over time.
  function transferableTokens(address holder, uint64 time) constant public returns (uint256) {
    return (mintingFinished ? balanceOf(holder) : 0);
  }

}
