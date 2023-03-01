const {ethers, networks} = require("hardhat");
const {expect} = require("chai");

const seconds_per_day = 86400;

async function moveBlocks(amount) {
  console.log("Moving Blocks in Hardhat Network");
  for(let i=0; i<amount; i++) {
    await network.provider.send("evm_mine", [])
  }

  console.log(`moved ${amount} Blocks.`);
}

async function moveTime(amount) {
  console.log("Moving time Forward");
  await network.provider.send("evm_increaseTime", [amount]);
  console.log(`Moved forward in the by ${amount} seconds`);
}

describe("Testing the Staking", async function() {
  let staking;
  let rewardToken;
  let deployer;
  let stakeAmount;

  beforeEach(async function() {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];

    const _rewardToken = await ethers.getContractFactory("RewardToken");
    rewardToken = await _rewardToken.deploy();

    const _staking = await ethers.getContractFactory("staking");
    staking = await _staking.deploy(rewardToken.address, rewardToken.address);

    stakeAmount = ethers.utils.parseEther("10000");

  });

  it("able to stake the tokens", async function() {
    await rewardToken.approve(staking.address, stakeAmount);
    await staking.stake(stakeAmount);

    const deployerAddress = deployer.getAddress();
    const startingEarned = await staking.earned(deployerAddress);

    console.log(`starting token earned in staking dapp ${startingEarned}`);

    await moveTime(seconds_per_day);
    await moveBlocks(1);
    const endingEarned = await staking.earned(deployerAddress);
    console.log(`Total reward tokens earned after 24 hours: ${endingEarned}`);


    expect(startingEarned).to.be.equal(0);
    expect(endingEarned).to.be.equal(8640000);
  })
})