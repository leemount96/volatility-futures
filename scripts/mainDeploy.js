const { ethers } = require("hardhat");

async function main() {
  const maxSupply = 100000000;
  const USDC = await hre.ethers.getContractFactory("USDCMock");
  const usdc = await USDC.deploy(maxSupply);

  await usdc.deployed();

  console.log("USDC deployed to:", usdc.address);

  const METAMASK_PUBKEY = "0x510B1130057b44A7Af60c3CF257528821eB2465C";
  const METAMASK_PUBKEY_2 = "0x61c154B0389E03EDAE576479e3D51793dDc03c25";
  const METAMASK_PUBKEY_3 = "0x3DF61217233b4b56026B3F832E4015d5298A8489";
  
  const SQUEETH_ROPSTEN_ADDRESS = "0x59f0c781a6ec387f09c40faa22b7477a2950d209";

  const initEVIXLevel = 160;

  const Oracle = await hre.ethers.getContractFactory("Oracle");
  const oracle = await Oracle.deploy(initEVIXLevel, SQUEETH_ROPSTEN_ADDRESS);

  await oracle.deployed();

  console.log("Oracle deployed to:", oracle.address);

  let currentNormalization = ethers.BigNumber.from("661952215156645403");
  let expectedNormalization = ethers.BigNumber.from("662387433446515165");

  await oracle.updateSpotFromSqueeth(currentNormalization, expectedNormalization);

  const VPoolStartPrice = await oracle.spotEVIXLevel();

  const PerpVPool = await hre.ethers.getContractFactory("PerpVPool");
  const perpVPool = await PerpVPool.deploy(VPoolStartPrice, usdc.address);

  await perpVPool.deployed();

  console.log("PerpVPool deployed to:", perpVPool.address);

  const initMarginLevel = 50;
  const lowRiskMargin = 40;
  const highRiskMargin = 30;
  const liquidationLevel = 20;

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

  await usdc.transfer(METAMASK_PUBKEY, 500000);

  console.log("Transferred 500,000 mock USDC to: ", METAMASK_PUBKEY);
  
  await usdc.transfer(METAMASK_PUBKEY_2, 1000000);

  console.log("Transferred 1,000,000 mock USDC to: ", METAMASK_PUBKEY_2);

  await usdc.transfer(METAMASK_PUBKEY_3, 1000000);

  console.log("Transferred 1,000,000 mock USDC to: ", METAMASK_PUBKEY_3);

  const [owner] = await hre.ethers.getSigners();

  const txHash = await owner.sendTransaction({
    to: METAMASK_PUBKEY,
    value: ethers.utils.parseEther("1.0"),
  });

  console.log("Transferred 1.0 ETH to:", METAMASK_PUBKEY);

  const txHash_2 = await owner.sendTransaction({
    to: METAMASK_PUBKEY_2,
    value: ethers.utils.parseEther("1.0"),
  });

  console.log("Transferred 1.0 ETH to:", METAMASK_PUBKEY_2);

  const txHash_3 = await owner.sendTransaction({
    to: METAMASK_PUBKEY_3,
    value: ethers.utils.parseEther("1.0"),
  });

  console.log("Transferred 1.0 ETH to:", METAMASK_PUBKEY_3);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
