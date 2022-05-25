const { ethers } = require("hardhat");


async function main() {

  const METAMASK_PUBKEY = "0x510B1130057b44A7Af60c3CF257528821eB2465C";
  const METAMASK_PUBKEY_2 = "0x61c154B0389E03EDAE576479e3D51793dDc03c25";
  const METAMASK_PUBKEY_3 = "0x3DF61217233b4b56026B3F832E4015d5298A8489";
  
  const SQUEETH_ROPSTEN_ADDRESS = "0x59f0c781a6ec387f09c40faa22b7477a2950d209";

  const initEVIXLevel = 160;

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with account: ", deployer.address);

  const Oracle = await hre.ethers.getContractFactory("Oracle");
  const oracle = await Oracle.deploy(initEVIXLevel, SQUEETH_ROPSTEN_ADDRESS);

  await oracle.deployed();

  console.log("Oracle deployed to:", oracle.address);

  let currentNormalization = ethers.BigNumber.from("661952215156645403");
  let expectedNormalization = ethers.BigNumber.from("662387433446515165");

  await oracle.updateSpotFromSqueeth(currentNormalization, expectedNormalization);
  let VPoolStartPrice = await oracle.spotEVIXLevel();
  console.log("Starting level:", VPoolStartPrice);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
