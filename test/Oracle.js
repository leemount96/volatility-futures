const { expect } = require("chai");
const { parse } = require("dotenv");
const { Contract } = require("ethers");
const { ethers } = require("hardhat");

describe("VPerp", function () {
  let Oracle;
  let deployedOracle;

  let owner;
  let addr1;
  let addrs;

  let squeethAddress = "0x59f0c781a6ec387f09c40faa22b7477a2950d209";

  let initEVIXLevel = 10;

  // runs before each test
  beforeEach(async function () {
    // get contract factory and signers
    Oracle = await ethers.getContractFactory("Oracle");
    [owner, addr1, ...addrs] = await ethers.getSigners();

    deployedOracle = await Oracle.deploy(initEVIXLevel, squeethAddress);
  });

  describe("Oracle Deployment", function () {
    it("Deploying Oracle should set initial price", async function () {
      expect(await deployedOracle.spotEVIXLevel()).to.equal(initEVIXLevel);
    });
  });

  describe("Updating price", function () {
    it("Update price from owner", async function () {
      await deployedOracle.connect(owner).manualUpdateSpotLevel(12);
      expect(await deployedOracle.spotEVIXLevel()).to.equal(12);
    });

    it("Attempt to update from non-onwer", async function () {
      await expect(
        deployedOracle.connect(addr1).manualUpdateSpotLevel(12)
      ).to.be.revertedWith("Only owner can update");
    });
  });

  describe("Squeeth calculations", function () {
    it("Check math on squeeth calculation", async function () {
      await deployedOracle.connect(owner).updateSpotFromSqueeth();
      let expNorm = 667470490629307856;
      let curNorm = 668359241497821737;
      let funding = 1 - expNorm/curNorm;
      let IV =  Math.sqrt(365/17.5*funding);
      console.log(funding);
      console.log(IV*10**18);
    })
  })
});
