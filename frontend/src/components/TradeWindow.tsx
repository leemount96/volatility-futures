import React, { useState } from "react";
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

  const [tradePosition, updatePosition] = useState({
    hasPosition: false,
    EVIXAmount: 0,
    fundingPNL: 0,
    openingPrice: 0,
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

  const GetPositionState = async () => {
    let position = await marginpool.functions.positions(connectedAddress);
    if (position.amountVPerp.toNumber() !== 0){
      updatePosition({
        hasPosition: true,
        EVIXAmount: position.amountVPerp.toNumber(),
        fundingPNL: position.fundingPNL.toNumber(),
        openingPrice: position.tradedPrice.toNumber(),
      })
    }
  };


  const submitBuyLong = async (event: any) => {
    event.preventDefault();
    let tradeAmount = parseInt(event.target.tradeAmount.value);
    let USDCAmount = tradeAmount * parseInt(EVIXPoolPrice!);
    await marginpool.functions.openLongPosition(USDCAmount);
    let position = await marginpool.functions.positions(connectedAddress);

    updatePosition({
      hasPosition: true,
      EVIXAmount: position.amountVPerp.toNumber(),
      fundingPNL: 0,
      openingPrice: position.tradedPrice.toNumber(),
    })

    await GetEVIXPoolPrice();
  };

  const submitSellShort = async (event: any) => {
    event.preventDefault();
    let tradeAmount = parseInt(event.target.tradeAmount.value);
    let USDCAmount = tradeAmount * parseInt(EVIXPoolPrice!);
    await marginpool.functions.openShortPosition(USDCAmount);
    let position = await marginpool.functions.positions(connectedAddress);
    
    updatePosition({
      hasPosition: true,
      EVIXAmount: position.amountVPerp.toNumber(),
      fundingPNL: 0,
      openingPrice: position.tradedPrice.toNumber(),
    })

    await GetEVIXPoolPrice();
  };

  const submitCloseLong = async () => {
    await marginpool.functions.closeLongPosition();
    updatePosition({
      hasPosition: false,
      EVIXAmount: 0,
      fundingPNL: 0,
      openingPrice: 0
    })
  }

  const submitCloseShort = async () => {
    await marginpool.functions.closeShortPosition();
    updatePosition({
      hasPosition: false,
      EVIXAmount: 0,
      fundingPNL: 0,
      openingPrice: 0
    })
  }

  GetConnectedWalletAddress();
  GetCollateralAmount();
  GetEVIXIndexMark();
  GetEVIXPoolPrice();
  GetPoolState();
  GetPositionState();

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
            Position Size: {tradePosition.EVIXAmount.toString()}
          </ListGroupItem>
          <ListGroupItem>
            Accrued Funding: {tradePosition.fundingPNL.toString()}
          </ListGroupItem>
          <ListGroupItem>
            Opening Price: {tradePosition.openingPrice.toString()}
          </ListGroupItem>
        </ListGroup>
        <Card.Body>
          {tradePosition.EVIXAmount > 0
          ? <Button variant="primary" onClick={submitCloseLong}>Close Long Position</Button>
          : <Button variant="danger" onClick={submitCloseShort}>Close Short Position</Button>}  
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
          <form onSubmit={submitBuyLong}>
            <input
              id="tradeAmount"
              type="text"
              placeholder="Amount of EVIX"
            />
            <Button type={"submit"}>
              Buy
            </Button>
          </form>
          </InputGroup>
          <InputGroup className="mb-3">
          <form onSubmit={submitSellShort}>
            <input
              id="tradeAmount"
              type="text"
              placeholder="Amount of EVIX"
            />
            <Button type={"submit"} variant="danger">
              Sell
            </Button>
          </form>
          </InputGroup>
        </Card.Body>
      </Card>
    );
  }
  return tradeCard;
};

export default TradeWindowComponent;
