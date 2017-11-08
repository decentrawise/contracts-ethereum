var MN8 = artifacts.require("./MN8.sol");
// var Auth = artifacts.require("./Auth.sol");
// var Stem = artifacts.require("./Stem.sol");
// var Artist = artifacts.require("./Artist.sol");

module.exports = function(deployer) {
  deployer.deploy(MN8);
  // deployer.deploy(Auth);
  // deployer.deploy(Stem);
  // deployer.link(Auth, Artist);
  // deployer.link(Stem, Artist);
  // deployer.deploy(Artist);
};
