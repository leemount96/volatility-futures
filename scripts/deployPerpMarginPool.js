const hre = require("hardhat");

async function main() {
  //set init long and short margin to 30%
  const initLongMargin = 0.3 * 10 ** 8;
  const initShortMargin = 0.3 * 10 ** 8;
  const oracleAddress = "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1";
  const vPerpAddress = "0x59b670e9fA9D0A427751Af201D676719a970857b";

  const Pool = await hre.ethers.getContractFactory("PerpMarginPool");
  const pool = await Pool.deploy(
    initLongMargin,
    initShortMargin,
    oracleAddress,
    vPerpAddress
  );

  await pool.deployed();

  console.log("Margin Pool deployed to:", pool.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
