import React, { useState, useContext } from "react";
import { vpool, marginpool } from "./libs/ContractObjects";
import EVIXContext from "./contexts/EVIXContext";
import UserContext from "./contexts/UserContext";
import "./ComponentStyling.css";

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
    updateMargin(val / 10 ** 8);
  };

  const submitBuyLong = async (event: any) => {
    event.preventDefault();
    let tradeAmount = parseInt(event.target.tradeAmount.value) * 10 ** 10;
    await marginpool.functions.openLongPosition(tradeAmount);
    event.target.reset();
  };

  const submitSellShort = async (event: any) => {
    event.preventDefault();
    let tradeAmount = parseInt(event.target.tradeAmount.value) * 10 ** 10;
    await marginpool.functions.openShortPosition(tradeAmount);
    event.target.reset();
  };

  const submitCloseLong = async () => {
    await marginpool.functions.closeLongPosition();
  };

  const submitCloseShort = async () => {
    await marginpool.functions.closeShortPosition();
  };

  GetMarginRate();

  let evixContext = useContext(EVIXContext);
  let userContext = useContext(UserContext);
  let poolContext = useContext(PoolContext);

  let tradeCard;

  if (userContext.tradePosition!.hasTradePosition) {
    tradeCard = (
      <Card style={{ width: "25rem" }} className="me-5 mt-5">
        <Card.Body>
          <Card.Title>Trade EVIX</Card.Title>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem>
            Current Collateral:
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
          <p className="positionHeader" >Current Position:</p>
          <ListGroup>
            <ListGroupItem>
              Position Size:
              <Card.Text className="DataField">
                {userContext.tradePosition!.EVIXAmount.toLocaleString()} EVIX
              </Card.Text>
            </ListGroupItem>
            <ListGroupItem>
              Accrued Funding:
              <Card.Text className="DataField">
                {userContext.tradePosition!.fundingPNL.toLocaleString()} USDC
              </Card.Text>
            </ListGroupItem>
            <ListGroupItem>
              Opening Price:
              <Card.Text className="DataField">
                {userContext.tradePosition!.openingPrice.toLocaleString()} USDC
              </Card.Text>
            </ListGroupItem>
          </ListGroup>
          <Card.Body>
            {userContext.tradePosition!.EVIXAmount > 0 ? (
              <Button
                variant="primary"
                className="DataField"
                onClick={submitCloseLong}
              >
                Close Long Position
              </Button>
            ) : (
              <Button
                variant="danger"
                className="DataField"
                onClick={submitCloseShort}
              >
                Close Short Position
              </Button>
            )}
          </Card.Body>
        </Card.Body>
      </Card>
    );
  } else {
    tradeCard = (
      <Card style={{ width: "25rem" }} className="me-5 mt-5">
        <Card.Body>
          <Card.Title>Trade EVIX</Card.Title>
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
            Current Initial Margin Rate:
            <Card.Text className="DataField">
              {" "}
              {evixContext.initialMargin.toLocaleString()}%
            </Card.Text>
          </ListGroupItem>
          <ListGroupItem>
            Maximum Trade Size:
            <Card.Text className="DataField">
              {(
                userContext.depositedCollateral /
                (evixContext.initialMargin / 100)
              ).toLocaleString()}{" "}
              USDC
            </Card.Text>
          </ListGroupItem>
        </ListGroup>
        <Card.Body>
          <form onSubmit={submitBuyLong}>
            <input id="tradeAmount" type="text" placeholder="Amount of USDC" />
            <Button className="DataField" type={"submit"}>
              Buy EVIX
            </Button>
          </form>
        </Card.Body>
        <Card.Body>
          <form onSubmit={submitSellShort}>
            <input id="tradeAmount" type="text" placeholder="Amount of USDC" />
            <Button className="DataField" type={"submit"} variant="danger">
              Sell EVIX
            </Button>
          </form>
        </Card.Body>
      </Card>
    );
  }
  return tradeCard;
};

export default TradeWindowComponent;
