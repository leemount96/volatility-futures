import React, { useState } from "react";
import { ethers } from "ethers";
import usdcJson from "../abis/USDCMock.json";
import oracleJson from "../abis/Oracle.json";
import vpoolJson from "../abis/PerpVPool.json";

import {
  Button,
  Card,
  ListGroup,
  ListGroupItem,
  InputGroup,
  FormControl,
} from "react-bootstrap";

let provider;
if(window.ethereum){
provider = new ethers.providers.Web3Provider(window.ethereum);
}

const USDC_ADDRESS = process.env.REACT_APP_USDC_ADDRESS!;
const usdcAbi = usdcJson.abi;
const usdc = new ethers.Contract(USDC_ADDRESS, usdcAbi, provider);

const MARGINPOOL_ADDRESS = process.env.REACT_APP_MARGINPOOL_ADDRESS!;

const ORACLE_ADDRESS = process.env.REACT_APP_ORACLE_ADDRESS!;
const oracleAbi = oracleJson.abi;
const oracle = new ethers.Contract(ORACLE_ADDRESS, oracleAbi, provider);

const VPOOL_ADDRESS = process.env.REACT_APP_VPOOL_ADDRESS!;
const vpoolAbi = vpoolJson.abi;
const vpool = new ethers.Contract(VPOOL_ADDRESS, vpoolAbi, provider);

export const HomeComponent = () => {
  const [depositedUSDC, updateDepositedUSDC] = useState({
    amount: 0,
  });
  const [EVIXOraclePrice, updateEVIXOraclePrice] = useState();
  const [EVIXPoolPrice, updateEVIXPoolPrice] = useState();

  const GetEVIXIndexMark = async () => {
    let val = await oracle.functions.spotEVIXLevel();
    updateEVIXOraclePrice(val.toString());
  };

  const GetEVIXPoolPrice = async () => {
    let val = await vpool.functions.price();
    updateEVIXPoolPrice(val.toString());
  };

  const GetDespositedTotal = async () => {
    let valMarginPool = await usdc.functions.balanceOf(MARGINPOOL_ADDRESS);
    let valVPool = await usdc.functions.balanceOf(VPOOL_ADDRESS);
    updateDepositedUSDC({
      amount:
        parseInt(valMarginPool.toString()) + parseInt(valVPool.toString()),
    });
  };

  GetDespositedTotal();
  GetEVIXIndexMark();
  GetEVIXPoolPrice();

  return (
    <Card style={{ width: "18rem" }} className="text-center me-5 mt-5">
      <Card.Body>
        <Card.Title>Total USDC Deposited</Card.Title>
        <Card.Text className="text-center">
          {depositedUSDC.amount} USDC
        </Card.Text>
      </Card.Body>
      <Card.Body>
        <Card.Title>Current EVIX Index Level</Card.Title>
        <Card.Text className="text-center">
          {EVIXOraclePrice}
        </Card.Text>
      </Card.Body>
      <Card.Body>
        <Card.Title>Current EVIX Pool Price</Card.Title>
        <Card.Text className="text-center">
          {EVIXPoolPrice}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};
