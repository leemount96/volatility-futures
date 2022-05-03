const hre = require("hardhat");

async function main() {
  //set init long and short margin to 30%
  const initLongMargin = .3*10**8;
  const initShortMargin = .3*10**8;
  const oracleAddress = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";

  const Pool = await hre.ethers.getContractFactory("MarginPool");
  const pool = await Pool.deploy(initLongMargin, initShortMargin, oracleAddress);

  await pool.deployed();

  console.log("Margin Pool deployed to:", pool.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
