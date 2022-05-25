import React, { useContext } from "react";
import { marginpool } from "./libs/ContractObjects";
import { ethers } from "ethers";
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
    let lpAmount = ethers.BigNumber.from(event.target.lpAmount.value).mul(ethers.BigNumber.from(10**10));
    await marginpool.functions.provideLiquidity(lpAmount);
    event.target.reset();
  };

  const removeLiquidityHandler = async () => {
    await marginpool.functions.removeLiquidity();
  };

  let evixContext = useContext(EVIXContext);
  let userContext = useContext(UserContext);
  let poolContext = useContext(PoolContext);

  let lpCard;

  if (userContext.LPPosition!.hasLPPosition) {
    lpCard = (
      <Card style={{ width: "25rem" }} className="me-5 mt-5">
        <Card.Body>
          <Card.Title>Remove EVIX Liquidity</Card.Title>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem>
            Available Collateral:
            <Card.Text className="DataField">
              {" "}
              {userContext.depositedCollateral.toLocaleString()} USDC
            </Card.Text>
          </ListGroupItem>
          <ListGroupItem>
            Current EVIX Index Mark:
            <Card.Text className="DataField">
              {" "}
              {evixContext.spotEVIXLevel.toLocaleString()}
            </Card.Text>
          </ListGroupItem>
          <ListGroupItem>
            Current EVIX Pool Price:
            <Card.Text className="DataField">
              {" "}
              {evixContext.poolEVIXLevel.toLocaleString()}{" "}
            </Card.Text>
          </ListGroupItem>

          <ListGroupItem>
            USDC In Pool:
            <Card.Text className="DataField">
              {" "}
              {poolContext.amountUSDC.toLocaleString()} USDC
            </Card.Text>
          </ListGroupItem>
          <ListGroupItem>
            EVIX In Pool:
            <Card.Text className="DataField">
              {" "}
              {poolContext.amountEVIX.toLocaleString()} EVIX
            </Card.Text>
          </ListGroupItem>
          <ListGroupItem>
            Current Pool Fee Rate:
            <Card.Text className="DataField"> {poolContext.feeRate}%</Card.Text>
          </ListGroupItem>
        </ListGroup>
        <Card.Body>
          <p className="positionHeader">Initial LP Position:</p>
          <ListGroup>
          <ListGroupItem>
            USDC:
            <Card.Text className="DataField">
              {userContext.LPPosition!.USDCAmount.toLocaleString()}
            </Card.Text>
          </ListGroupItem>
          <ListGroupItem>
            EVIX:
            <Card.Text className="DataField">
              {userContext.LPPosition!.EVIXAmount.toLocaleString()}
            </Card.Text>
          </ListGroupItem>

          </ListGroup>
          <Card.Body>
          <Button
            className="DataField"
            variant="danger"
            onClick={removeLiquidityHandler}
          >
            Remove Liquidity
          </Button>
          </Card.Body>
        </Card.Body>
      </Card>
    );
  } else {
    lpCard = (
      <Card style={{ width: "25rem" }} className="me-5 mt-5">
        <Card.Body>
          <Card.Title>Provide EVIX Liquidity</Card.Title>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem>
            Available Collateral:
            <Card.Text className="DataField">
              {" "}
              {userContext.depositedCollateral.toLocaleString()} USDC
            </Card.Text>
          </ListGroupItem>
          <ListGroupItem>
            Current EVIX Index Mark:
            <Card.Text className="DataField">
              {" "}
              {evixContext.spotEVIXLevel.toLocaleString()}
            </Card.Text>
          </ListGroupItem>
          <ListGroupItem>
            Current EVIX Pool Price:
            <Card.Text className="DataField">
              {" "}
              {evixContext.poolEVIXLevel.toLocaleString()}
            </Card.Text>
          </ListGroupItem>

          <ListGroupItem>
            Current Pool Fee Rate:
            <Card.Text className="DataField"> {poolContext.feeRate}%</Card.Text>
          </ListGroupItem>
          <ListGroupItem>
            USDC In Pool:
            <Card.Text className="DataField">
              {" "}
              {poolContext.amountUSDC.toLocaleString()} USDC
            </Card.Text>
          </ListGroupItem>
          <ListGroupItem>
            EVIX In Pool:
            <Card.Text className="DataField">
              {" "}
              {poolContext.amountEVIX.toLocaleString()} EVIX
            </Card.Text>
          </ListGroupItem>
        </ListGroup>
        <Card.Body>
          Provide Liquidity
          <form onSubmit={SendToLiquidityPool}>
            <input
              id="lpAmount"
              type="text"
              placeholder="Amount of USDC to LP"
            />
            <Button className="DataField" type={"submit"}>
              Send to LP
            </Button>
          </form>
        </Card.Body>
      </Card>
    );
  }

  return lpCard;
};
