var BlockCapsule = artifacts.require("./BlockCapsule.sol");

module.exports = function(deployer) {
    deployer.deploy(BlockCapsule);
};