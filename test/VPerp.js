const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VPerp", function () {
  let VPerp;
  let deployedVPerp;

  let owner;
  let addr1;
  let addr2;
  let addrs;

  // runs before each test
  beforeEach(async function () {
    // get contract factory and signers
    VPerp = await ethers.getContractFactory("VPerp");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // deploy contract
    deployedVPerp = await VPerp.deploy();
  })

  describe("Perp Initialization", function (){
    it("Initializing Perp should set marginPool address", async function () {
        await deployedVPerp.init(addr1.address); //for testing purposes, send addr1 as MarginPool address
        expect(await deployedVPerp.marginPool().to.equal(addr1));
    })
  });
});
