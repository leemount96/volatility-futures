const hre = require("hardhat");

async function main() {
    const maxSupply = 100000;
    const USDC = await hre.ethers.getContractFactory("USDCMock");
    const usdc = await USDC.deploy(maxSupply);

    await usdc.deployed();

    console.log("USDC deployed to:", usdc.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
