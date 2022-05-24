import React, { useContext, useState } from "react";
import { vpool, marginpool } from "./libs/ContractObjects";
import EVIXContext from "./contexts/EVIXContext";
import UserContext from "./contexts/UserContext";

import {
  Button,
  Card,
  ListGroup,
  ListGroupItem,
  InputGroup, 
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export const LPComponent = () => {
  const [FeeRate, updateFeeRate] = useState(0);
  const [PoolState, updatePoolState] = useState({
    amountUSDC: 0,
    amountEVIX: 0,
  });

  const GetFeeRate = async () => {
    let val = await vpool.functions.feePercentage();
    updateFeeRate(val/(10**8));
  };

  const GetPoolState = async () => {
    let USDCAmount = await vpool.functions.poolUSDC();
    let EVIXAmount = await vpool.functions.poolVPerp();
    updatePoolState({
      amountUSDC: parseInt(USDCAmount.toString())/10**10,
      amountEVIX: parseInt(EVIXAmount.toString())/10**8,
    });
  };


  const SendToLiquidityPool = async (event: any) => {
    event.preventDefault();
    let lpAmount = parseInt(event.target.lpAmount.value)*10**10;
    await marginpool.functions.provideLiquidity(lpAmount);
    event.target.reset();
  };

  const removeLiquidityHandler = async () => {
    await marginpool.functions.removeLiquidity();
  }

  GetPoolState();
  GetFeeRate();

  let evixContext = useContext(EVIXContext);
  let userContext = useContext(UserContext);

  let lpCard;

  if (userContext.LPPosition!.hasLPPosition) {
    lpCard = (
      <Card style={{ width: "22rem" }} className="me-5 mt-5">
        <Card.Body>
          <Card.Title>Remove EVIX Liquidity</Card.Title>
          <Card.Text>Window for removing liquidity in EVIX AMM Pool</Card.Text>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem>
            Current EVIX Pool Price:
            {" "}{evixContext.poolEVIXLevel.toLocaleString()} 
          </ListGroupItem>
          <ListGroupItem>
            Current EVIX Index Mark:
            {" "}{evixContext.spotEVIXLevel.toLocaleString()}
          </ListGroupItem>
          <ListGroupItem>
            Current Pool Fee Rate:
            {" "}{FeeRate}%
          </ListGroupItem>
          <ListGroupItem>
            USDC In Pool:
            {" "}{PoolState.amountUSDC.toLocaleString()}{" "} USDC
          </ListGroupItem>
          <ListGroupItem>
            EVIX In Pool:
            {" "}{PoolState.amountEVIX.toLocaleString()}{" "} EVIX
          </ListGroupItem>
        </ListGroup>
        <Card.Body>
          Current Position:
          <Card.Body>
            USDC: {(userContext.LPPosition!.USDCAmount).toLocaleString("en-US")}
          </Card.Body>
          <Card.Body>
            EVIX: {(userContext.LPPosition!.EVIXAmount).toLocaleString()}
          </Card.Body>
          <Button variant="danger" onClick={removeLiquidityHandler}>Remove Liquidity</Button>
        </Card.Body>
      </Card>
    );
  } else {
    lpCard = (
      <Card style={{ width: "22rem" }} className="me-5 mt-5">
        <Card.Body>
          <Card.Title>Provide EVIX Liquidity</Card.Title>
          <Card.Text>Window for providing liquidity in EVIX AMM Pool</Card.Text>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem>
            Available Collateral:
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
            Current Pool Fee Rate:
            0.{FeeRate}%
          </ListGroupItem>
          <ListGroupItem>
            USDC In Pool:
            {" "}{PoolState.amountUSDC.toLocaleString()}{" "} USDC
          </ListGroupItem>
          <ListGroupItem>
            EVIX In Pool:
            {" "}{PoolState.amountEVIX.toLocaleString()}{" "} EVIX
          </ListGroupItem>
        </ListGroup>
        <Card.Body>
          Provide Liquidity
          <InputGroup className="mb-3">
            <form onSubmit={SendToLiquidityPool}>
              <input
                id="lpAmount"
                type="text"
                placeholder="Amount of USDC to LP"
              />
              <Button type={"submit"}>Send to LP</Button>
            </form>
          </InputGroup>
        </Card.Body>
      </Card>
    );
  }

  return lpCard;
};
