const MN8 = artifacts.require('MN8');

contract('MN8', function(accounts) {
  // it('main account is the owner', async function() {
  //   const mn8 = await MN8.deployed();
  //
  //   const owner = await mn8.owner.call();
  //   assert.equal(owner.valueOf(), accounts[0], 'main account is not the owner');
  // });

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

  it('should have an initial supply of 0', async function() {
    const mn8 = await MN8.deployed();

    const supply = await mn8.totalSupply();
    assert.equal(supply, 0, 'initial supply is not 0');
  });
});
