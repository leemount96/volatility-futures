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

  let initEVIXLevel = 10;

  // runs before each test
  beforeEach(async function () {
    // get contract factory and signers
    Oracle = await ethers.getContractFactory("Oracle");
    [owner, addr1, ...addrs] = await ethers.getSigners();

    deployedOracle = await Oracle.deploy(initEVIXLevel);
  });

  describe("Oracle Deployment", function () {
    it("Deploying Oracle should set initial price", async function () {
      expect(await deployedOracle.spotEVIXLevel()).to.equal(initEVIXLevel);
    });
  });

  describe("Updating price", function () {
    it("Update price from owner", async function () {
      await deployedOracle.connect(owner).updateSpotLevel(12);
      expect(await deployedOracle.spotEVIXLevel()).to.equal(12);
    });

    it("Attempt to update from non-onwer", async function () {
      await expect(
        deployedOracle.connect(addr1).updateSpotLevel(12)
      ).to.be.revertedWith("Only owner can update");
    });
  });
});
