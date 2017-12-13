var MN8 = artifacts.require("./MN8.sol");
var PreSale = artifacts.require("./PreSale.sol");

module.exports = function(deployer) {
  deployer.deploy(MN8);
  deployer.deploy(PreSale);
};
