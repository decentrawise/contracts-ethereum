const MN8 = artifacts.require('MN8');

contract('MN8', function(accounts) {
  it('main account is the owner', async function() {
    const mn8 = await MN8.deployed();

    const owner = await mn8.owner.call();
    assert.equal(owner, accounts[0], 'main account is not the owner');
  });

  it('should be named EMANATE', async function() {
    const mn8 = await MN8.deployed();

    const name = await mn8.name();
    assert.equal(name, 'EMANATE', 'name is not EMANATE');
  });

  it('should have it\'s symbol as MN8', async function() {
    const mn8 = await MN8.deployed();

    const sym = await mn8.symbol();
    assert.equal(sym, 'MN8', 'symbol is not MN8');
  });

  it('should have 18 decimal places', async function() {
    const mn8 = await MN8.deployed();

    const dec = await mn8.decimals();
    assert.equal(dec, 18, 'decimal places are not 18');
  });

  it('should have an initial supply of 0', async function() {
    const mn8 = await MN8.deployed();

    const supply = await mn8.totalSupply();
    assert.equal(supply, 0, 'initial supply is not 0');
  });

  it('should have mintingFinished false', async function() {
    const mn8 = await MN8.deployed();

    const mintFinish = await mn8.mintingFinished();
    assert.equal(mintFinish, false, 'mintingFinished is not false');
  });

  it('should accept adding owner to mintAgents', async function() {
    const mn8 = await MN8.deployed();

    const hasIt = await mn8.mintAgents(accounts[0]);
    assert.equal(hasIt, false, 'mintAgents has owner already');
    const res = await mn8.setMintAgent(accounts[0], true);
    assert.equal(res.logs[0].event, 'MintingAgentChanged', 'addMintAgent failed to add owner');
    const nowHasIt = await mn8.mintAgents(accounts[0]);
    assert.equal(nowHasIt, true, 'mintAgents has owner already');
  });

  it('should accept minting 1000 MN8 to owner account', async function() {
    const mn8 = await MN8.deployed();

    const initBalance = await mn8.balanceOf(accounts[0]);
    assert.equal(initBalance.valueOf(), 0, 'initial balance of owner is not 0');
    const res = await mn8.mint(accounts[0], 1000);
    assert.equal(res.logs[0].event, 'Mint', 'mint failed to add 1000 MN8 to owner');
    const finalBalance = await mn8.balanceOf(accounts[0]);
    assert.equal(finalBalance.valueOf(), 1000, 'final balance of owner is not 1000');
  });

  it('should accept minting 1000 MN8 to second account', async function() {
    const mn8 = await MN8.deployed();

    const initBalance = await mn8.balanceOf(accounts[1]);
    assert.equal(initBalance.valueOf(), 0, 'initial balance of second account is not 0');
    const res = await mn8.mint(accounts[1], 1000);
    assert.equal(res.logs[0].event, 'Mint', 'mint failed to add 1000 MN8 to second account');
    const finalBalance = await mn8.balanceOf(accounts[1]);
    assert.equal(finalBalance.valueOf(), 1000, 'final balance of second account is not 1000');
  });

  it('should have now a total supply of 2000', async function() {
    const mn8 = await MN8.deployed();

    const supply = await mn8.totalSupply();
    assert.equal(supply, 2000, 'total supply is not 2000 now');
  });

  it('should accept finishing minting forever', async function() {
    const mn8 = await MN8.deployed();

    const initMintFinish = await mn8.mintingFinished();
    assert.equal(initMintFinish, false, 'mintingFinished is not false');
    const res = await mn8.finishMinting();
    assert.equal(res.logs[0].event, 'MintFinished', 'finishMinting failed to execute');
    const finalMintFinish = await mn8.mintingFinished();
    assert.equal(finalMintFinish, true, 'mintingFinished is not true');
  });

  it('should not accept minting 1000 MN8 to third account', async function() {
    const mn8 = await MN8.deployed();

    const initBalance = await mn8.balanceOf(accounts[2]);
    assert.equal(initBalance.valueOf(), 0, 'initial balance of third account is not 0');
    try {
      const res = await mn8.mint(accounts[2], 1000);
      assert.notEqual(res.logs[0].event, 'Mint', 'mint didn\'t fail to add 1000 MN8 to third account');
    }
    catch(err) { }
    const finalBalance = await mn8.balanceOf(accounts[2]);
    assert.equal(finalBalance.valueOf(), 0, 'final balance of third account is not 0');
  });

  it('should accept transfer 100 MN8 to third account from owner', async function() {
    const mn8 = await MN8.deployed();

    const initBalance = await mn8.balanceOf(accounts[2]);
    assert.equal(initBalance.valueOf(), 0, 'initial balance of third account is not 0');
    const res = await mn8.transfer(accounts[2], 100);
    assert.equal(res.logs[0].event, 'Transfer', 'transfer of 100 MN8 to third account not successful');
    const ownerBalance = await mn8.balanceOf(accounts[0]);
    assert.equal(ownerBalance.valueOf(), 900, 'owner balance is not 900');
    const finalBalance = await mn8.balanceOf(accounts[2]);
    assert.equal(finalBalance.valueOf(), 100, 'final balance of third account is not 100');
  });
});
