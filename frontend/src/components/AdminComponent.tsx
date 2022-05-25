import React, { useContext } from "react";
import { ethers } from "ethers";
import { oracle, marginpool, usdc } from "./libs/ContractObjects";
import EVIXContext from "./contexts/EVIXContext";
import "./ComponentStyling.css";

import {
  Button,
  Card,
  ListGroup,
  ListGroupItem,
  InputGroup,
  CardGroup,
} from "react-bootstrap";

export const AdminComponent = () => {
  const ManualUpdateOraclePrice = async (event: any) => {
    event.preventDefault();
    let newPrice = parseInt(event.target.newPrice.value) * 100;
    await oracle.functions.manualUpdateSpotLevel(newPrice);
    event.target.reset();
  };

  const TriggerSqueethPriceUpdate = async () => {
    let curNorm = ethers.BigNumber.from("656348510618649822");
    let expNorm = ethers.BigNumber.from("655671105569580649");
    await oracle.functions.updateSpotFromSqueeth(curNorm, expNorm);
  };

  const SettleAddressFunding = async (event: any) => {
    event.preventDefault();
    let address = event.target.address.value;
    await marginpool.functions._settleFunding(address);

    event.target.reset();
  };

  const sendMockUSDC = async (event: any) => {
    event.preventDefault();
    let address = event.target.address.value;
    let amount = ethers.BigNumber.from(event.target.amount.value).mul(ethers.BigNumber.from(10**10));
    await usdc.functions.mintToUser(address, amount);

    event.target.reset();
  }

  let evixContext = useContext(EVIXContext);

  let oracleCard = (
    <Card style={{ width: "18rem" }} className="me-5 mt-5">
      <Card.Body>
        <Card.Title>Update Oracle</Card.Title>
      </Card.Body>
      <ListGroup className="list-group-flush">
        <ListGroupItem>
          Current EVIX Pool Price:
          <Card.Text className="DataField">
            {" "}
            {evixContext.poolEVIXLevel}
          </Card.Text>
        </ListGroupItem>
        <ListGroupItem>
          Current EVIX Index Mark:
          <Card.Text className="DataField">
            {" "}
            {evixContext.spotEVIXLevel}
          </Card.Text>
        </ListGroupItem>
        <Card.Body>
          Update EVIX Via Squeeth
          <Button className="DataField" onClick={TriggerSqueethPriceUpdate}>
            Trigger Update
          </Button>
        </Card.Body>
      </ListGroup>
      <Card.Body>
        Update EVIX Manually:
        <form onSubmit={ManualUpdateOraclePrice}>
          <input id="newPrice" type="text" placeholder="Level to set EVIX to" />
          <Button className="DataField" type={"submit"}>
            Update EVIX
          </Button>
        </form>
      </Card.Body>
    </Card>
  );

  let fundingCard = (
    <Card style={{ width: "18rem" }} className="me-5 mt-5">
      <Card.Body>
        <Card.Title>Settle Funding</Card.Title>
      </Card.Body>
      <ListGroup className="list-group-flush">
        <ListGroupItem>
          Current EVIX Pool Price:
          <Card.Text className="DataField">
            {" "}
            {evixContext.poolEVIXLevel}
          </Card.Text>
        </ListGroupItem>
        <ListGroupItem>
          Current EVIX Index Mark:
          <Card.Text className="DataField">
            {" "}
            {evixContext.spotEVIXLevel}
          </Card.Text>
        </ListGroupItem>
      </ListGroup>
      <Card.Body>
        Settle Address Funding
        <form onSubmit={SettleAddressFunding}>
          <input id="address" type="text" placeholder="Address to settle" />
          <Button className="DataField" type={"submit"}>
            Settle Funding
          </Button>
        </form>
      </Card.Body>
    </Card>
  );

  let mockUSDCCard = (
    <Card style={{ width: "18rem" }} className="me-5 mt-5">
      <Card.Body>
        <Card.Title>Get Mock USDC</Card.Title>
      </Card.Body>
      <Card.Body>
        Mint USDC to Address
        <form onSubmit={sendMockUSDC}>
          <input id="address" type="text" placeholder="Address" />
          <input id="amount" type="text" placeholder="Amount" />
          <Button className="DataField" type={"submit"}>
            Send USDC
          </Button>
        </form>
      </Card.Body>
    </Card>
  );

  return (
    <CardGroup>
      {oracleCard}
      {fundingCard}
      {mockUSDCCard}
    </CardGroup>
  );
};
