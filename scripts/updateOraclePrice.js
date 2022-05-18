const hre = require("hardhat");
const fetch = require('node-fetch');
const ethers = require("ethers");
require('dotenv').config({path: '../.env'});
const oracleJson = require('../artifacts/contracts/core/Oracle.sol/Oracle.json');
const oracleAbi = oracleJson.abi;

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

  const response = await fetch("https://api.volmex.finance/graphql", {
    method: "post",
    body: data,
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
      "User-Agent": "Node",
    },
  });

  const json = await response.json();
  return parseInt(json.data.impliedVolatilitys[0].index * 10 ** 8);
}

async function main() {
  const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS;
  const volLevel = await getVolLevel();

  const [owner] = await hre.ethers.getSigners();

  const oracle = new ethers.Contract(ORACLE_ADDRESS, oracleAbi, owner);
  oracle.updateSpotLevel(volLevel);

  console.log("Oracle price updated to: ", volLevel);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
