async function main() {
    const maxSupply = 100000;
    const USDC = await hre.ethers.getContractFactory("USDCMock");
    const usdc = await USDC.deploy(maxSupply);

    await usdc.deployed();

    console.log("USDC deployed to:", usdc.address);

    const initEVIXLevel = 100;

    const Oracle = await hre.ethers.getContractFactory("Oracle");
    const oracle = await Oracle.deploy(initEVIXLevel);

    await oracle.deployed();

    console.log("Oracle deployed to:", oracle.address);

    const PerpVPool = await hre.ethers.getContractFactory("PerpVPool");
    const perpVPool = await PerpVPool.deploy(initEVIXLevel, usdc.address);

    await perpVPool.deployed();

    console.log("PerpVPool deployed to:", perpVPool.address);

    const initMarginLevel = 5;
    const lowRiskMargin = 4;
    const highRiskMargin = 3;
    const liquidationLevel = 2;

    const PerpMarginPool = await hre.ethers.getContractFactory("PerpMarginPool");
    const perpMarginPool = await PerpMarginPool.deploy(initMarginLevel, lowRiskMargin, highRiskMargin, liquidationLevel, oracle.address, perpVPool.address, usdc.address);

    await perpMarginPool.deployed();

    console.log("Margin pool deployed to:", perpMarginPool.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
