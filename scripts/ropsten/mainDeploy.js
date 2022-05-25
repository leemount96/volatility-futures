const { ethers } = require("hardhat");

async function main() {
  const maxSupply = ethers.BigNumber.from("1000000000000000000000");
  const USDC = await hre.ethers.getContractFactory("USDCMock");
  const usdc = await USDC.deploy(maxSupply);

  await usdc.deployed();

  console.log("USDC deployed to:", usdc.address);

  const METAMASK_PUBKEY = "0x510B1130057b44A7Af60c3CF257528821eB2465C";
  const METAMASK_PUBKEY_2 = "0x61c154B0389E03EDAE576479e3D51793dDc03c25";
  const METAMASK_PUBKEY_3 = "0x3DF61217233b4b56026B3F832E4015d5298A8489";
  
  const SQUEETH_ROPSTEN_ADDRESS = "0x59f0c781a6ec387f09c40faa22b7477a2950d209";

  const initEVIXLevel = 115*100;

  const Oracle = await hre.ethers.getContractFactory("Oracle");
  const oracle = await Oracle.deploy(initEVIXLevel, SQUEETH_ROPSTEN_ADDRESS);

  await oracle.deployed();

  console.log("Oracle deployed to:", oracle.address);

  const VPoolStartPrice = await oracle.spotEVIXLevel();
  const feePercentage = 1*10**8;

  const PerpVPool = await hre.ethers.getContractFactory("PerpVPool");
  const perpVPool = await PerpVPool.deploy(VPoolStartPrice, usdc.address, feePercentage);

  await perpVPool.deployed();

  console.log("PerpVPool deployed to:", perpVPool.address);

  const initMarginLevel = 50*10**8;
  const lowRiskMargin = 40*10**8;
  const highRiskMargin = 30*10**8;
  const liquidationLevel = 20*10**8;

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

  await usdc.transfer(METAMASK_PUBKEY, 500000*10**10);

  console.log("Transferred 500,000 mock USDC to: ", METAMASK_PUBKEY);
  
  await usdc.transfer(METAMASK_PUBKEY_2, 500000*10**10);

  console.log("Transferred 500,000 mock USDC to: ", METAMASK_PUBKEY_2);

  await usdc.transfer(METAMASK_PUBKEY_3, 500000*10**10);

  console.log("Transferred 500,000 mock USDC to: ", METAMASK_PUBKEY_3);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
