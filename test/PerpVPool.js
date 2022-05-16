const { expect } = require("chai");
const { parse } = require("dotenv");
const { Contract } = require("ethers");
const { ethers } = require("hardhat");

describe("VPerp", function () {
  let PerpVPool;
  let deployedPool;

  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addrs;

  let startingPrice = 10;
  let maxSupplyUSDC = 100000;

  let addr1USDC = 10000;
  let addr2USDC = 10000;
  let addr3USDC = 10000;

  // runs before each test
  beforeEach(async function () {
    // get contract factory and signers
    PerpVPool = await ethers.getContractFactory("PerpVPool");
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();

    USDC = await ethers.getContractFactory("USDCMock");
    deployedUSDC = await USDC.deploy(maxSupplyUSDC);
    deployedPool = await PerpVPool.deploy(startingPrice, deployedUSDC.address);

    await deployedUSDC.transfer(addr1.address, addr1USDC);
    await deployedUSDC.connect(addr1).approve(deployedPool.address, addr1USDC);

    await deployedUSDC.transfer(addr2.address, addr2USDC);
    await deployedUSDC.connect(addr2).approve(deployedPool.address, addr2USDC);
    await deployedUSDC.transfer(addr3.address, addr3USDC);
    await deployedUSDC.connect(addr3).approve(deployedPool.address, addr3USDC);
  })

  describe("Pool Deployment", function (){
    it("Deploying Pool should set initial price", async function () {
        expect(await deployedPool.price()).to.equal(startingPrice);
    })
  });

  describe("Providing Liquidity", function (){
    beforeEach(async function (){ 
    })

    it("Providing liquidity from addr1", async function (){
        await deployedPool.provideLiquidity(addr1.address, 1000);
        expect(await deployedPool.poolUSDC()).to.equal(1000);
        expect(await deployedPool.poolVPerp()).to.equal(100);
    })

    it("Provide liquidity from addr2 after addr1", async function (){
        await deployedPool.provideLiquidity(addr1.address, 1000);
        await deployedPool.provideLiquidity(addr2.address, 1000);
        expect(await deployedPool.poolUSDC()).to.equal(2000);
        expect(await deployedPool.poolVPerp()).to.equal(200);
    })
  });

  describe("Buying from pool by depositing USDC", function (){
    beforeEach(async function (){ 
        await deployedPool.provideLiquidity(addr1.address, 1000);
    })

    it("Buy from pool for addr2 with normal inputs", async function (){
        await deployedPool.connect(addr2).buy(500);

        var tradedEvent = await deployedPool.queryFilter("TradedVPerp");
        var parsedEvent = tradedEvent[0].args;

        expect(await deployedPool.poolUSDC()).to.equal(1500);
        expect(await deployedUSDC.balanceOf(deployedPool.address)).to.equal(1500);
        expect(await deployedUSDC.balanceOf(addr2.address)).to.equal(addr2USDC - 500);

        expect(await deployedPool.poolVPerp()).to.equal(66);
        expect(await deployedPool.price()).to.equal(22);
        expect(parsedEvent.price).to.equal(14);
        expect(parsedEvent.amount).to.equal(34);
    })

    it("Buy from pool for addr2 then again from addr3", async function (){
        await deployedPool.connect(addr2).buy(500);
        await deployedPool.connect(addr3).buy(500);

        var tradedEvent = await deployedPool.queryFilter("TradedVPerp");
        var parsedEvent = tradedEvent[tradedEvent.length - 1].args;

        expect(await deployedPool.poolUSDC()).to.equal(2000);
        expect(await deployedUSDC.balanceOf(deployedPool.address)).to.equal(2000);
        expect(await deployedUSDC.balanceOf(addr3.address)).to.equal(addr3USDC - 500);

        expect(await deployedPool.poolVPerp()).to.equal(49); //should be 50, need to figure out rounding
        expect(await deployedPool.price()).to.equal(40);
        expect(parsedEvent.price).to.equal(29);
        expect(parsedEvent.amount).to.equal(17);
    })
  });

  describe("Buying from pool amount of VPerp", function (){
    beforeEach(async function (){ 
        await deployedPool.provideLiquidity(addr1.address, 1000);
    })

    it("Buy from pool for addr2 with normal inputs", async function (){
        await deployedPool.connect(addr2).buyAmountVPerp(20);

        var tradedEvent = await deployedPool.queryFilter("TradedVPerp");
        var parsedEvent = tradedEvent[0].args;

        expect(await deployedPool.poolUSDC()).to.equal(1250);
        expect(await deployedUSDC.balanceOf(deployedPool.address)).to.equal(1250);
        expect(await deployedUSDC.balanceOf(addr2.address)).to.equal(addr2USDC - 250);

        expect(await deployedPool.poolVPerp()).to.equal(80);
        expect(await deployedPool.price()).to.equal(15);
        expect(parsedEvent.price).to.equal(12);
        expect(parsedEvent.amount).to.equal(20);
    })

    it("Buy from pool for addr2 then again from addr3", async function (){
        await deployedPool.connect(addr2).buyAmountVPerp(20);
        await deployedPool.connect(addr3).buyAmountVPerp(20);

        var tradedEvent = await deployedPool.queryFilter("TradedVPerp");
        var parsedEvent = tradedEvent[tradedEvent.length - 1].args;

        expect(await deployedPool.poolUSDC()).to.equal(1666);
        expect(await deployedUSDC.balanceOf(deployedPool.address)).to.equal(1666);
        expect(await deployedUSDC.balanceOf(addr3.address)).to.equal(addr3USDC - 416);

        expect(await deployedPool.poolVPerp()).to.equal(60);
        expect(await deployedPool.price()).to.equal(27);
        expect(parsedEvent.price).to.equal(20);
        expect(parsedEvent.amount).to.equal(20);
    })
  });

  describe("Selling VPerp into pool by withdrawing USDC", function (){
    beforeEach(async function (){ 
        await deployedPool.provideLiquidity(addr1.address, 1000);
    })

    it("Sell into pool for addr2 with normal inputs", async function (){
        await deployedPool.connect(addr2).sell(500);

        var tradedEvent = await deployedPool.queryFilter("TradedVPerp");
        var parsedEvent = tradedEvent[0].args;

        expect(await deployedPool.poolUSDC()).to.equal(500);
        expect(await deployedUSDC.balanceOf(deployedPool.address)).to.equal(500);
        expect(await deployedUSDC.balanceOf(addr2.address)).to.equal(addr2USDC + 500);

        expect(await deployedPool.poolVPerp()).to.equal(200);
        expect(await deployedPool.price()).to.equal(2);
        expect(parsedEvent.price).to.equal(5);
        expect(parsedEvent.amount).to.equal(100);
    })

    it("Sell into pool from addr2 then again from addr3", async function (){
        await deployedPool.connect(addr2).sell(500);
        await deployedPool.connect(addr3).sell(100);

        var tradedEvent = await deployedPool.queryFilter("TradedVPerp");
        var parsedEvent = tradedEvent[tradedEvent.length - 1].args;

        expect(await deployedPool.poolUSDC()).to.equal(400);
        expect(await deployedUSDC.balanceOf(deployedPool.address)).to.equal(400);
        expect(await deployedUSDC.balanceOf(addr3.address)).to.equal(addr3USDC + 100);

        expect(await deployedPool.poolVPerp()).to.equal(250); //should be 50, need to figure out rounding
        expect(await deployedPool.price()).to.equal(1);
        expect(parsedEvent.price).to.equal(2);
        expect(parsedEvent.amount).to.equal(50);
    })
  });

  describe("Selling VPerp into pool by selling specific amount", function (){
    beforeEach(async function (){ 
        await deployedPool.provideLiquidity(addr1.address, 1000);
    })

    it("Sell into pool for addr2 with normal inputs", async function (){
        await deployedPool.connect(addr2).sellAmountVPerp(50);

        var tradedEvent = await deployedPool.queryFilter("TradedVPerp");
        var parsedEvent = tradedEvent[0].args;

        expect(await deployedPool.poolUSDC()).to.equal(666);
        expect(await deployedUSDC.balanceOf(deployedPool.address)).to.equal(666);
        expect(await deployedUSDC.balanceOf(addr2.address)).to.equal(addr2USDC + 334);

        expect(await deployedPool.poolVPerp()).to.equal(150);
        expect(await deployedPool.price()).to.equal(4);
        expect(parsedEvent.price).to.equal(6);
        expect(parsedEvent.amount).to.equal(50);
    })

    it("Sell into pool from addr2 then again from addr3", async function (){
        await deployedPool.connect(addr2).sellAmountVPerp(50);
        await deployedPool.connect(addr3).sellAmountVPerp(75);

        var tradedEvent = await deployedPool.queryFilter("TradedVPerp");
        var parsedEvent = tradedEvent[tradedEvent.length - 1].args;

        expect(await deployedPool.poolUSDC()).to.equal(444);
        expect(await deployedUSDC.balanceOf(deployedPool.address)).to.equal(444);
        expect(await deployedUSDC.balanceOf(addr3.address)).to.equal(addr3USDC + 222);

        expect(await deployedPool.poolVPerp()).to.equal(225); //should be 50, need to figure out rounding
        expect(await deployedPool.price()).to.equal(1);
        expect(parsedEvent.price).to.equal(2);
        expect(parsedEvent.amount).to.equal(75);
    })
  });
});
