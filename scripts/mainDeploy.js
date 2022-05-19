const { ethers } = require("hardhat");

async function main() {
  const maxSupply = 100000;
  const USDC = await hre.ethers.getContractFactory("USDCMock");
  const usdc = await USDC.deploy(maxSupply);

  await usdc.deployed();

  console.log("USDC deployed to:", usdc.address);

  const METAMASK_PUBKEY = "0x510B1130057b44A7Af60c3CF257528821eB2465C";
  const SQUEETH_ROPSTEN_ADDRESS = "0x59f0c781a6ec387f09c40faa22b7477a2950d209";

  const initEVIXLevel = 100;

  const Oracle = await hre.ethers.getContractFactory("Oracle");
  const oracle = await Oracle.deploy(initEVIXLevel, SQUEETH_ROPSTEN_ADDRESS);

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
  const perpMarginPool = await PerpMarginPool.deploy(
    initMarginLevel,
    lowRiskMargin,
    highRiskMargin,
    liquidationLevel,
    oracle.address,
    perpVPool.address,
    usdc.address
  );

  await perpMarginPool.deployed();

  console.log("Margin pool deployed to:", perpMarginPool.address);

  await usdc.transfer(METAMASK_PUBKEY, 50000);

  console.log("Transferred 50,000 mock USDC to: ", METAMASK_PUBKEY);

  const [owner] = await hre.ethers.getSigners();

  const txHash = await owner.sendTransaction({
    to: METAMASK_PUBKEY,
    value: ethers.utils.parseEther("1.0"),
  });

  console.log("Transferred 1.0 ETH to:", METAMASK_PUBKEY);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
