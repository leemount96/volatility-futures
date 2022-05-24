import React, { useContext } from "react";
import { marginpool } from "./libs/ContractObjects";
import EVIXContext from "./contexts/EVIXContext";
import UserContext from "./contexts/UserContext";
import PoolContext from "./contexts/PoolContext";

import {
  Button,
  Card,
  ListGroup,
  ListGroupItem,
  InputGroup, 
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export const LPComponent = () => {

  const SendToLiquidityPool = async (event: any) => {
    event.preventDefault();
    let lpAmount = parseInt(event.target.lpAmount.value)*10**10;
    await marginpool.functions.provideLiquidity(lpAmount);
    event.target.reset();
  };

  const removeLiquidityHandler = async () => {
    await marginpool.functions.removeLiquidity();
  }

  let evixContext = useContext(EVIXContext);
  let userContext = useContext(UserContext);
  let poolContext = useContext(PoolContext);

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
            {" "}{poolContext.feeRate}%
          </ListGroupItem>
          <ListGroupItem>
            USDC In Pool:
            {" "}{poolContext.amountUSDC.toLocaleString()}{" "} USDC
          </ListGroupItem>
          <ListGroupItem>
            EVIX In Pool:
            {" "}{poolContext.amountEVIX.toLocaleString()}{" "} EVIX
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
            {" "}{poolContext.feeRate}%
          </ListGroupItem>
          <ListGroupItem>
            USDC In Pool:
            {" "}{poolContext.amountUSDC.toLocaleString()}{" "} USDC
          </ListGroupItem>
          <ListGroupItem>
            EVIX In Pool:
            {" "}{poolContext.amountEVIX.toLocaleString()}{" "} EVIX
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
