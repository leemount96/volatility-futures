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
  DropdownButton,
  Dropdown,
  FormControl,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const ORACLE_ADDRESS = process.env.REACT_APP_ORACLE_ADDRESS!;
const oracleAbi = oracleJson.abi;
const oracle = new ethers.Contract(ORACLE_ADDRESS, oracleAbi, provider);

const VPOOL_ADDRESS = process.env.REACT_APP_VPOOL_ADDRESS!;
const vpoolAbi = vpoolJson.abi;
const vpool = new ethers.Contract(VPOOL_ADDRESS, vpoolAbi, signer);

const MARGINPOOL_ADDRESS = process.env.REACT_APP_MARGINPOOL_ADDRESS!;
const marginpoolAbi = marginpoolJson.abi;
const marginpool = new ethers.Contract(
  MARGINPOOL_ADDRESS,
  marginpoolAbi,
  signer
);

const TradeWindowComponent = () => {
  const [EVIXOraclePrice, updateEVIXOraclePrice] = useState();
  const [EVIXPoolPrice, updateEVIXPoolPrice] = useState();
  const [PoolState, updatePoolState] = useState({
    amountUSDC: 0,
    amountEVIX: 0,
  });

  const [connectedAddress, updateConnectedAddress] = useState({
    address: "",
  });

  const [collateralAmount, updateCollateralAmount] = useState({
    amount: 0,
  });

  const GetEVIXIndexMark = async () => {
    let val = await oracle.functions.spotEVIXLevel();
    updateEVIXOraclePrice(val.toString());
  };

  const GetEVIXPoolPrice = async () => {
    let val = await vpool.functions.price();
    updateEVIXPoolPrice(val.toString());
  };

  const GetConnectedWalletAddress = async () => {
    window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then((res: any) => updateConnectedAddress(res[0]));
  };

  const GetCollateralAmount = async () => {
    let val = await marginpool.functions.freeCollateralMap(connectedAddress);
    updateCollateralAmount({ amount: parseInt(val.toString()) });
  };

  const GetPoolState = async () => {
    let USDCAmount = await vpool.functions.poolUSDC();
    let EVIXAmount = await vpool.functions.poolVPerp();
    updatePoolState({
      amountUSDC: parseInt(USDCAmount.toString()),
      amountEVIX: parseInt(EVIXAmount.toString()),
    });
  };

  const [tradePosition, updatePosition] = useState({
    hasPosition: false,
    EVIXAmount: 0,
    fundingPNL: 0,
    openingPrice: 0,
  });

  const setBuy = () => {};

  const setSell = () => {};

  const submitTrade = () => {};

  GetConnectedWalletAddress();
  GetCollateralAmount();
  GetEVIXIndexMark();
  GetEVIXPoolPrice();
  GetPoolState();

  let tradeCard;

  if (tradePosition.hasPosition) {
    tradeCard = (
      <Card style={{ width: "18rem" }} className="me-5 mt-5">
        <Card.Body>
          <Card.Title>Trade EVIX</Card.Title>
          <Card.Text>Window for closing existing position</Card.Text>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem>
            Current Collateral:
            {collateralAmount.amount}
          </ListGroupItem>
          <ListGroupItem>
            Current EVIX Pool Price:
            {EVIXPoolPrice}
          </ListGroupItem>
          <ListGroupItem>
            Current EVIX Index Mark:
            {EVIXOraclePrice}
          </ListGroupItem>
          <ListGroupItem>
            USDC In Pool:
            {PoolState.amountUSDC}{" "}
          </ListGroupItem>
          <ListGroupItem>
            EVIX In Pool:
            {PoolState.amountEVIX}{" "}
          </ListGroupItem>
          <ListGroupItem>
            Position Size: {tradePosition.EVIXAmount}
          </ListGroupItem>
          <ListGroupItem>
            Accrued Funding: {tradePosition.fundingPNL}
          </ListGroupItem>
          <ListGroupItem>
            Opening Price: {tradePosition.openingPrice}
          </ListGroupItem>
        </ListGroup>
        <Card.Body>
          <Button variant="primary">Close Position</Button>
        </Card.Body>
      </Card>
    );
  } else {
    tradeCard = (
      <Card style={{ width: "18rem" }} className="me-5 mt-5">
        <Card.Body>
          <Card.Title>Trade EVIX</Card.Title>
          <Card.Text>
            Window for viewing current EVIX stats and trading the perp
          </Card.Text>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem>
            Available Collateral:
            {collateralAmount.amount}
          </ListGroupItem>
          <ListGroupItem>
            Current EVIX Pool Price:
            {EVIXPoolPrice}
          </ListGroupItem>
          <ListGroupItem>
            Current EVIX Index Mark:
            {EVIXOraclePrice}
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
            <DropdownButton
              variant="outline-secondary"
              title="Buy"
              id="input-group-dropdown-1"
            >
              <Dropdown.Item onClick={setBuy} href="#">
                Buy
              </Dropdown.Item>
              <Dropdown.Item onClick={setSell} href="#">
                Sell
              </Dropdown.Item>
            </DropdownButton>
            <FormControl aria-label="Text input with dropdown button" />
          </InputGroup>
          <Button variant="primary" onClick={submitTrade}>
            Submit Trade
          </Button>
        </Card.Body>
      </Card>
    );
  }
  return tradeCard;
};

export default TradeWindowComponent;
