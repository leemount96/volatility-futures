const fetch = require('node-fetch');
require('dotenv').config();

async function getVolLevel() {
  const data = JSON.stringify({
    query: `{
        impliedVolatilitys(limit:1, offset: 0, query: {
            asset: ETH
          }, sort: "-timestamp") {
            index
            asset
            timestamp
            underlying_index
          }
      }`,
  });

  const response = await fetch(
    'https://api.volmex.finance/graphql',
    {
      method: 'post',
      body: data,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'User-Agent': 'Node',
      },
    }
  );

  const json = await response.json();
  return parseInt(json.data.impliedVolatilitys[0].index*(10**8));
}

const hre = require("hardhat");

async function main() {
  const Oracle = await hre.ethers.getContractFactory("Oracle");
  const oracle = await Oracle.deploy(getVolLevel());

  await oracle.deployed();

  console.log("Oracle deployed to:", oracle.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
