import React, { useState, useContext } from "react";
import { vpool, marginpool} from "./libs/ContractObjects";
import EVIXContext from "./contexts/EVIXContext";
import UserContext from "./contexts/UserContext";

import {
  Button,
  Card,
  ListGroup,
  ListGroupItem,
  InputGroup,
} from "react-bootstrap";
import PoolContext from "./contexts/PoolContext";

const TradeWindowComponent = () => {
  const [InitialMargin, updateMargin] = useState(0);

  const GetMarginRate = async () => {
    let val = await marginpool.functions.marginInit();
    updateMargin(val/10**8);
  }


  const submitBuyLong = async (event: any) => {
    event.preventDefault();
    let tradeAmount = parseInt(event.target.tradeAmount.value)*10**10;
    await marginpool.functions.openLongPosition(tradeAmount);
    event.target.reset();
  };

  const submitSellShort = async (event: any) => {
    event.preventDefault();
    let tradeAmount = parseInt(event.target.tradeAmount.value)*10**10;
    await marginpool.functions.openShortPosition(tradeAmount);
    event.target.reset();
  };

  const submitCloseLong = async () => {
    await marginpool.functions.closeLongPosition();
  }

  const submitCloseShort = async () => {
    await marginpool.functions.closeShortPosition();
  }

  GetMarginRate();

  let evixContext = useContext(EVIXContext);
  let userContext = useContext(UserContext);
  let poolContext = useContext(PoolContext);

  let tradeCard;

  if (userContext.tradePosition!.hasTradePosition) {
    tradeCard = (
      <Card style={{ width: "22rem" }} className="me-5 mt-5">
        <Card.Body>
          <Card.Title>Trade EVIX</Card.Title>
          <Card.Text>Window for closing existing position</Card.Text>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem>
            Current Collateral:
            {" "}{userContext.depositedCollateral.toLocaleString()} USDC
          </ListGroupItem>
          <ListGroupItem>
            Current EVIX Pool Price:
            {" "}{evixContext.poolEVIXLevel.toLocaleString()}
          </ListGroupItem>
          <ListGroupItem>
            Current EVIX Index Mark:
            {" "}{evixContext.spotEVIXLevel.toLocaleString()}
          </ListGroupItem>
          <ListGroupItem>
            USDC In Pool:
            {" "}{(poolContext.amountUSDC).toLocaleString()}{" "} USDC
          </ListGroupItem>
          <ListGroupItem>
            EVIX In Pool:
            {" "}{(poolContext.amountEVIX).toLocaleString()}{" "} EVIX
          </ListGroupItem>
          <ListGroupItem>
            Position Size: {userContext.tradePosition!.EVIXAmount.toLocaleString()} EVIX
          </ListGroupItem>
          <ListGroupItem>
            Accrued Funding: {userContext.tradePosition!.fundingPNL.toLocaleString()} USDC
          </ListGroupItem>
          <ListGroupItem>
            Opening Price: {userContext.tradePosition!.openingPrice.toLocaleString()} USDC
          </ListGroupItem>
        </ListGroup>
        <Card.Body>
          {userContext.tradePosition!.EVIXAmount > 0
          ? <Button variant="primary" onClick={submitCloseLong}>Close Long Position</Button>
          : <Button variant="danger" onClick={submitCloseShort}>Close Short Position</Button>}  
        </Card.Body>
      </Card>
    );
  } else {
    tradeCard = (
      <Card style={{ width: "22rem" }} className="me-5 mt-5">
        <Card.Body>
          <Card.Title>Trade EVIX</Card.Title>
          <Card.Text>
            Window for trading EVIX Perpetual Swap
          </Card.Text>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem>
            Available Collateral:
            {" "}{userContext.depositedCollateral.toLocaleString()} USDC
          </ListGroupItem>
          <ListGroupItem>
            Current Initial Margin Rate:
            {" "}{evixContext.initialMargin.toLocaleString()}%
          </ListGroupItem>
          <ListGroupItem>
            Current EVIX Pool Price:
            {" "}{evixContext.poolEVIXLevel.toLocaleString()} 
          </ListGroupItem>
          <ListGroupItem>
            Current EVIX Index Mark:
            {" "}{evixContext.spotEVIXLevel.toLocaleString()} 
          </ListGroupItem>
          <ListGroupItem>
            USDC In Pool:
            {" "}{(poolContext.amountUSDC).toLocaleString()}{" "} USDC
          </ListGroupItem>
          <ListGroupItem>
            EVIX In Pool:
            {" "}{(poolContext.amountEVIX).toLocaleString()}{" "} EVIX
          </ListGroupItem>
        </ListGroup>
        <Card.Body>
          Maximum Trade Size: {(userContext.depositedCollateral/(evixContext.initialMargin/100)).toLocaleString()}
          <InputGroup className="mb-3">
          <form onSubmit={submitBuyLong}>
            <input
              id="tradeAmount"
              type="text"
              placeholder="Amount of USDC"
            />
            <Button type={"submit"}>
              Buy EVIX
            </Button>
          </form>
          </InputGroup>
          <InputGroup className="mb-3">
          <form onSubmit={submitSellShort}>
            <input
              id="tradeAmount"
              type="text"
              placeholder="Amount of USDC"
            />
            <Button type={"submit"} variant="danger">
              Sell EVIX
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
