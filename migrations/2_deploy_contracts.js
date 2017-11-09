let utils = require("../test/utils/utils.js");
utils.setWeb3(web3);

let MultiSigWallet = artifacts.require("MultiSigWallet");
let DubbelToken = artifacts.require("DubbelToken");
let NewToken = artifacts.require("NewToken");
let UpgradeAgent = artifacts.require("UpgradeAgent");
let DUBVault = artifacts.require("DUBVault");


module.exports = function(deployer, network) {
  let dubbelMultisig;
  let upgradeMaster, agentOwner;
  let startBlock, endBlock;
  let accounts = web3.eth.accounts.slice(0,3);
  let signaturesRequired = 2;
  let token, wallet, upgradeAgent, newToken;
  if (network == 'testnet') {
    deployer.deploy(MultiSigWallet, accounts, signaturesRequired).then(function(instance){
      wallet = instance;
      upgradeMaster = web3.eth.accounts[0];
      agentOwner = upgradeMaster;
      dubbelMultisig = MultiSigWallet.address;
      startBlock = web3.eth.blockNumber + 10;
      endBlock = web3.eth.blockNumber + 20000;
      return deployer.deploy(DubbelToken, dubbelMultisig, upgradeMaster, startBlock, endBlock);
    }).then(function(instance){
      return DubbelToken.deployed();
    }).then(function(instance){
      token = instance;
    //   functionData = utils.getFunctionEncoding('UpgradeAgent(address)',[token.address]);
    //   return web3.eth.estimateGas({data:functionData});
    // }).then(function(gasEstimate){
    //   console.log(gasEstimate);
      gasEstimate = 2000000;
      return deployer.deploy(UpgradeAgent, token.address, {from: agentOwner, gas: gasEstimate + utils.gasEpsilon});
    }).then(function(){
      return UpgradeAgent.deployed();
    }).then(function(instance){
      upgradeAgent = instance;
      return token.setUpgradeAgent(upgradeAgent.address);
    }).then(function(){
      return deployer.deploy(NewToken,upgradeAgent.address);
    }).then(function(){
      return NewToken.deployed();
    }).then(function(instance){
      newToken = instance;
      return upgradeAgent.setNewToken(newToken.address);
    });
  } else if (network == 'mainnet') {
    // check this
    MultiSigWallet.at(utils.multisigWalletAddressMainNet).then(function(instance){
      wallet = instance;
      upgradeMaster = web3.eth.accounts[0];
      agentOwner = upgradeMaster;
      dubbelMultisig = MultiSigWallet.address;
      startBlock = startBlockMainNet;
      endBlock = endBlockMainNet;
      return deployer.deploy(DubbelToken, dubbelMultisig, upgradeMaster, startBlock, endBlock);
    }).then(function(instance){
      return DubbelToken.deployed();
    }).then(function(instance){
      token = instance;
    //   functionData = utils.getFunctionEncoding('UpgradeAgent(address)',[token.address]);
    //   return web3.eth.estimateGas({data:functionData});
    // }).then(function(gasEstimate){
    //   console.log(gasEstimate);
      gasEstimate = 2000000;
      return deployer.deploy(UpgradeAgent, token.address, {from: agentOwner, gas: gasEstimate + utils.gasEpsilon});
    }).then(function(){
      return UpgradeAgent.deployed();
    }).then(function(instance){
      upgradeAgent = instance;
      return token.setUpgradeAgent(upgradeAgent.address);
    });
  }
};
