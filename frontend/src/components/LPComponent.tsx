import React, { useEffect, useState, Component } from "react";
import { ethers } from "ethers";
import oracleJson from "../abis/Oracle.json";
import vpoolJson from "../abis/PerpVPool.json";
import marginpoolJson from "../abis/PerpMarginPool.json";

import {
  Button,
  Card,
  ListGroup,
  ListGroupItem,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const ORACLE_ADDRESS = process.env.REACT_APP_ORACLE_ADDRESS!;
const oracleAbi = oracleJson.abi;
const oracle = new ethers.Contract(ORACLE_ADDRESS, oracleAbi, signer);

const VPOOL_ADDRESS = process.env.REACT_APP_VPOOL_ADDRESS!;
const vpoolAbi = vpoolJson.abi;
const vpool = new ethers.Contract(VPOOL_ADDRESS, vpoolAbi, signer);

const MARGINPOOL_ADDRESS = process.env.REACT_APP_MARGINPOOL_ADDRESS!;
const marginpoolAbi = marginpoolJson.abi;
const marginpool = new ethers.Contract(MARGINPOOL_ADDRESS, marginpoolAbi, signer);

export const LPComponent = () => {
  const [EVIXOraclePrice, updateEVIXOraclePrice] = useState();
  const [EVIXPoolPrice, updateEVIXPoolPrice] = useState();
  const [PoolState, updatePoolState] = useState({
    amountUSDC: 0,
    amountEVIX: 0,
  });

  const [connectedAddress, updateConnectedAddress] = useState({
    address: ""
})

  const [collateralAmount, updateCollateralAmount] = useState({
      amount: 0,
  })

  const GetEVIXIndexMark = async () => {
    let val = await oracle.functions.spotEVIXLevel();
    updateEVIXOraclePrice(val.toString());
  };

  const GetEVIXPoolPrice = async () => {
    let val = await vpool.functions.price();
    updateEVIXPoolPrice(val.toString());
  };

  const GetConnectedWalletAddress = async () => {
    window.ethereum.request({method: "eth_requestAccounts" })
    .then((res: any) => updateConnectedAddress(res[0]))
  }

  const GetPoolState = async () => {
    let USDCAmount = await vpool.functions.poolUSDC();
    let EVIXAmount = await vpool.functions.poolVPerp();
    updatePoolState({ amountUSDC: parseInt(USDCAmount.toString()), amountEVIX: parseInt(EVIXAmount.toString()) });
  };

  const GetCollateralAmount = async () => {
    let val = await marginpool.functions.freeCollateralMap(connectedAddress);
    updateCollateralAmount({amount: parseInt(val.toString())});
  }

  const [lpPosition, updateLP] = useState({
    hasPosition: false,
    USDCAmount: 0,
    EVIXAmount: 0,
  });

  GetConnectedWalletAddress();
  GetCollateralAmount();
  GetEVIXIndexMark();
  GetEVIXPoolPrice();
  GetPoolState();

  let lpCard;

  if (lpPosition.hasPosition) {
    lpCard = (
      <Card style={{ width: "18rem" }} className="me-5 mt-5">
        <Card.Body>
          <Card.Title>Remove EVIX Liquidity</Card.Title>
          <Card.Text>Window for removing liquidity in EVIX AMM Pool</Card.Text>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem>
            Current EVIX Pool Price:
            {EVIXPoolPrice}
          </ListGroupItem>
          <ListGroupItem>
            USDC In Pool:
            {PoolState.amountUSDC}{" "}
          </ListGroupItem>
          <ListGroupItem>
            EVIX In Pool:
            {PoolState.amountEVIX}{" "}
          </ListGroupItem>
        </ListGroup>
        <Card.Body>
          <Button variant="danger">Remove Liquidity</Button>
        </Card.Body>
      </Card>
    );
  } else {
    lpCard = (
      <Card style={{ width: "18rem" }} className="me-5 mt-5">
        <Card.Body>
          <Card.Title>Provide EVIX Liquidity</Card.Title>
          <Card.Text>Window for providing liquidity in EVIX AMM Pool</Card.Text>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem>Available Collateral: 
              {collateralAmount.amount}
          </ListGroupItem>
          <ListGroupItem>
            Current EVIX Pool Price:
            {EVIXPoolPrice}
          </ListGroupItem>
          <ListGroupItem>
            USDC In Pool:
            {PoolState.amountUSDC}{" "}
          </ListGroupItem>
          <ListGroupItem>
            EVIX In Pool:
            {PoolState.amountEVIX}{" "}
          </ListGroupItem>
        </ListGroup>
        <Card.Body>
          <InputGroup className="mb-3">
            <Button variant="outline-secondary" id="button-addon1">
              LP
            </Button>
            <FormControl aria-label="USDC" aria-describedby="basic-addon1" />
          </InputGroup>
        </Card.Body>
      </Card>
    );
  }

  return lpCard;
};
