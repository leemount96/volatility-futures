const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PerpMarginPool", function () {
  let VPerp;
  let deployedVPerp;
  let PerpPool;
  let deployedPool;
  let Oracle;
  let deployedOracle;

  let owner;
  let addr1;
  let addr2;
  let addrs;

  let initLongRate = 50;
  let initShortRate = 60;
  let initEvolLevel = 80;

  // runs before each test
  beforeEach(async function () {
    // get contract factory and signers
    VPerp = await ethers.getContractFactory("VPerp");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // deploy contract
    deployedVPerp = await VPerp.deploy();

    Oracle = await ethers.getContractFactory("Oracle");
    deployedOracle = await Oracle.deploy(initEvolLevel);

    PerpPool = await ethers.getContractFactory("PerpMarginPool");
    deployedPool = await PerpPool.deploy(initLongRate, initShortRate, deployedOracle.address, deployedVPerp.address);
  })

  describe("Pool Deployment", function (){
    it("Deploying pool should set the correct owner & variables", async function () {
        expect(await deployedPool.owner()).to.equal(owner.address);
        expect(await deployedPool.longMarginInit()).to.equal(initLongRate);
        expect(await deployedPool.shortMarginInit()).to.equal(initShortRate);
    })
  });
});
