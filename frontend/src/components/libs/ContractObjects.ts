import { ethers } from "ethers";
import oracleJson from "../../abis/Oracle.json";
import vpoolJson from "../../abis/PerpVPool.json";
import marginpoolJson from "../../abis/PerpMarginPool.json";
import usdcJson from "../../abis/USDCMock.json";

let provider;
let signer;

if (window.ethereum) {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
}

const ORACLE_ADDRESS = process.env.REACT_APP_ORACLE_ADDRESS!;
const oracleAbi = oracleJson.abi;
export const oracle = new ethers.Contract(ORACLE_ADDRESS, oracleAbi, signer);

const VPOOL_ADDRESS = process.env.REACT_APP_VPOOL_ADDRESS!;
const vpoolAbi = vpoolJson.abi;
export const vpool = new ethers.Contract(VPOOL_ADDRESS, vpoolAbi, signer);

const MARGINPOOL_ADDRESS = process.env.REACT_APP_MARGINPOOL_ADDRESS!;
const marginpoolAbi = marginpoolJson.abi;
export const marginpool = new ethers.Contract(
  MARGINPOOL_ADDRESS,
  marginpoolAbi,
  signer
);

const USDC_ADDRESS = process.env.REACT_APP_USDC_ADDRESS!;
const usdcAbi = usdcJson.abi;
export const usdc = new ethers.Contract(USDC_ADDRESS, usdcAbi, signer);
