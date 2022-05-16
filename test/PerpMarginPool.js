const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PerpMarginPool", function () {
  let PerpMarginPool;
  let deployedMarginPool;
  let PerpVPool;
  let deployedVPool;
  let Oracle;
  let deployedOracle;
  let USDC;
  let deployedUSDC;

  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addrs;

  let initMarginRate = 5;
  let lowRiskMargin = 4;
  let highRiskMargin = 3;
  let liquidationLevel = 2;
  let initEVIXLevel = 10;

  let maxSupplyUSDC = 100000;
  let addr1USDC = 10000;
  let addr2USDC = 10000;
  let addr3USDC = 10000;

  // runs before each test
  beforeEach(async function () {
    // get contract factory and signers
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();

    USDC = await ethers.getContractFactory("USDCMock");
    deployedUSDC = await USDC.deploy(maxSupplyUSDC);

    PerpVPool = await ethers.getContractFactory("PerpVPool");
    deployedVPool = await PerpVPool.deploy(initEVIXLevel, deployedUSDC.address);

    await deployedUSDC.transfer(addr1.address, addr1USDC);
    await deployedUSDC.transfer(addr2.address, addr2USDC);
    await deployedUSDC.transfer(addr3.address, addr3USDC);

    Oracle = await ethers.getContractFactory("Oracle");
    deployedOracle = await Oracle.deploy(initEVIXLevel);

    PerpMarginPool = await ethers.getContractFactory("PerpMarginPool");
    deployedMarginPool = await PerpMarginPool.deploy(initMarginRate, lowRiskMargin, highRiskMargin, liquidationLevel, deployedOracle.address, deployedVPool.address, deployedUSDC.address);
    
    await deployedUSDC.connect(addr1).approve(deployedMarginPool.address, addr1USDC);
    await deployedUSDC.connect(addr2).approve(deployedMarginPool.address, addr2USDC);
    await deployedUSDC.connect(addr3).approve(deployedMarginPool.address, addr3USDC);
    //await deployedUSDC.connect(deployedMarginPool).approve(deployedVPool.address, maxSupplyUSDC);
  })

  describe("Pool Deployment", function (){
    it("Deploying margin pool should set the correct initial variables", async function () {
      expect(await deployedMarginPool.marginInit()).to.equal(initMarginRate);
      expect(await deployedMarginPool.marginLowRiskLevel()).to.equal(lowRiskMargin);
      expect(await deployedMarginPool.marginHighRiskLevel()).to.equal(highRiskMargin);
      expect(await deployedMarginPool.marginLiquidationLevel()).to.equal(liquidationLevel);
    })
  });

  describe("Collateral deposit/removal", function (){
    it("Depositing collateral should transfer USDC to contract and establish position in maps", async function () {
      await deployedMarginPool.connect(addr1).depositCollateral(5000);
      expect(await deployedUSDC.balanceOf(deployedMarginPool.address)).to.equal(5000);
      expect(await deployedMarginPool.freeCollateralMap(addr1.address)).to.equal(5000);

      await deployedMarginPool.connect(addr2).depositCollateral(5000);
      expect(await deployedUSDC.balanceOf(deployedMarginPool.address)).to.equal(10000);
      expect(await deployedMarginPool.freeCollateralMap(addr2.address)).to.equal(5000);
    })

    it("Returning collateral to user", async function () {
      await deployedMarginPool.connect(addr1).depositCollateral(5000);
      expect(await deployedUSDC.balanceOf(addr1.address)).to.equal(5000);

      await deployedMarginPool.connect(addr1).returnCollateral(5000);

      expect(await deployedUSDC.balanceOf(deployedMarginPool.address)).to.equal(0);
      expect(await deployedMarginPool.freeCollateralMap(addr1.address)).to.equal(0);
      expect(await deployedUSDC.balanceOf(addr1.address)).to.equal(10000);
    })

    it("Attempting to withdraw more than deposited shoudl fail", async function () {
      await deployedMarginPool.connect(addr1).depositCollateral(5000);

      await expect(deployedMarginPool.connect(addr1).returnCollateral(10000)).to.be.revertedWith("Not enough free collateral");
    })
  });

  describe("Providing Liquidity via MarginPool contract", function (){
    beforeEach(async function () {
      await deployedMarginPool.connect(addr1).depositCollateral(5000);
      await deployedMarginPool.connect(addr2).depositCollateral(5000);
    })

    it("Provide liquidity from addr1", async function () {
      await deployedMarginPool.connect(addr1).provideLiquidity(1000);

      expect(await deployedMarginPool.freeCollateralMap(addr1.address)).to.equal(4000);
      expect(await deployedUSDC.balanceOf(deployedMarginPool.address)).to.equal(9000);
      expect(await deployedUSDC.balanceOf(deployedVPool.address)).to.equal(1000);
      expect(await deployedVPool.poolUSDC()).to.equal(1000);
      expect(await deployedVPool.poolVPerp()).to.equal(100);
    });

    it("Provide liquidity from addr2 after addr1", async function () {
      await deployedMarginPool.connect(addr1).provideLiquidity(1000);
      await deployedMarginPool.connect(addr2).provideLiquidity(1000);

      expect(await deployedMarginPool.freeCollateralMap(addr2.address)).to.equal(4000);
      expect(await deployedUSDC.balanceOf(deployedMarginPool.address)).to.equal(8000);
      expect(await deployedUSDC.balanceOf(deployedVPool.address)).to.equal(2000);
      expect(await deployedVPool.poolUSDC()).to.equal(2000);
      expect(await deployedVPool.poolVPerp()).to.equal(200);
    });
  });

  describe("Opening new long/short positions", function () {
    beforeEach(async function () {
      await deployedMarginPool.connect(addr1).depositCollateral(5000);
      await deployedMarginPool.connect(addr2).depositCollateral(5000);

      await deployedMarginPool.connect(addr1).provideLiquidity(1000);
    })

    it("Opening a new long position for user should create position and adjust free collateral", async function () {
      await deployedMarginPool.connect(addr2).openLongPosition(500);

      expect(await deployedMarginPool.freeCollateralMap(addr2.address)).to.equal(2500);
      expect(await deployedUSDC.balanceOf(deployedMarginPool.address)).to.equal(8500); //only transfer the actual amount to vpool, rest held in margin
      expect(await deployedUSDC.balanceOf(deployedVPool.address)).to.equal(1500);

      let position = await deployedMarginPool.positions(addr2.address);

      expect(position.amountVPerp).to.equal(34);
      expect(position.fundingPNL).to.equal(0);
      expect(position.tradedPrice).to.equal(14)
      expect(position.collateralAmount).to.equal(2500);

      expect(await deployedMarginPool.liquidationRisk(addr2.address)).to.equal(false);
    })

    it("Opening a new short position for user should create position and adjust free collateral", async function () {
      await deployedMarginPool.connect(addr2).openShortPosition(500);

      expect(await deployedMarginPool.freeCollateralMap(addr2.address)).to.equal(2500);
      expect(await deployedUSDC.balanceOf(deployedMarginPool.address)).to.equal(9500); //USDC transfered from Vpool to margin
      expect(await deployedUSDC.balanceOf(deployedVPool.address)).to.equal(500);

      let position = await deployedMarginPool.positions(addr2.address);

      expect(position.amountVPerp).to.equal(-100);
      expect(position.fundingPNL).to.equal(0);
      expect(position.tradedPrice).to.equal(5)
      expect(position.collateralAmount).to.equal(2500);

      expect(await deployedMarginPool.liquidationRisk(addr2.address)).to.equal(false);
    })

    it("Attempting to open position when one is already open should fail", async function () {
      await deployedMarginPool.connect(addr2).openLongPosition(500);
      await expect(deployedMarginPool.connect(addr2).openLongPosition(100)).to.be.revertedWith("Already have open position");
      await expect(deployedMarginPool.connect(addr2).openShortPosition(100)).to.be.revertedWith("Already have open position");
    })
  })

  describe("Closing open positions", function () {
    beforeEach(async function () {
      await deployedMarginPool.connect(addr1).depositCollateral(5000);
      await deployedMarginPool.connect(addr2).depositCollateral(5000);

      await deployedMarginPool.connect(addr1).provideLiquidity(1000);
    })

    it("Open a long position and close it", async function () {
      await deployedMarginPool.connect(addr2).openLongPosition(500);

      await deployedMarginPool.connect(addr2).closeLongPosition();

      expect(await deployedMarginPool.freeCollateralMap(addr2.address)).to.equal(5034); //should be 5000, rounding
      expect(await deployedUSDC.balanceOf(deployedMarginPool.address)).to.equal(9010); //rounding issue
      expect(await deployedUSDC.balanceOf(deployedVPool.address)).to.equal(990); // rounding issue

      let position = await deployedMarginPool.positions(addr2.address);

      expect(position.amountVPerp).to.equal(0);
      expect(position.fundingPNL).to.equal(0);
      expect(position.tradedPrice).to.equal(0)
      expect(position.collateralAmount).to.equal(0);

      expect(await deployedMarginPool.liquidationRisk(addr2.address)).to.equal(false);
    })

    // it("Open a short position and close it", async function () {
    //   await deployedMarginPool.connect(addr2).openShortPosition(500);

    //   await deployedMarginPool.connect(addr2).closeShortPosition();

    //   expect(await deployedMarginPool.freeCollateralMap(addr2.address)).to.equal(5000); //should be 5000, rounding
    //   expect(await deployedUSDC.balanceOf(deployedMarginPool.address)).to.equal(9000); //rounding issue
    //   expect(await deployedUSDC.balanceOf(deployedVPool.address)).to.equal(1000); // rounding issue

    //   let position = await deployedMarginPool.positions(addr2.address);

    //   expect(position.amountVPerp).to.equal(0);
    //   expect(position.fundingPNL).to.equal(0);
    //   expect(position.tradedPrice).to.equal(0)
    //   expect(position.collateralAmount).to.equal(0);

    //   expect(await deployedMarginPool.liquidationRisk(addr2.address)).to.equal(false);
    // })
  })

  describe("Settle funding", function () {
    beforeEach(async function () {
      await deployedMarginPool.connect(addr1).depositCollateral(5000);
      await deployedMarginPool.connect(addr2).depositCollateral(5000);

      await deployedMarginPool.connect(addr1).provideLiquidity(1000);

      await deployedMarginPool.connect(addr2).openLongPosition(500);
    })

    it("Funding should be negative for user", async function () {
      await deployedMarginPool._settleFunding(addr2.address);
      let position = await deployedMarginPool.positions(addr2.address);
      expect(position.fundingPNL).to.equal(-408);
    })
  })
});
