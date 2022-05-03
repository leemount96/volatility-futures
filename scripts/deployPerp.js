const hre = require("hardhat");

async function main() {
  const VPerp = await hre.ethers.getContractFactory("VPerp");
  const vPerp = await VPerp.deploy();

  await vPerp.deployed();

  console.log("VPerp deployed to:", vPerp.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
