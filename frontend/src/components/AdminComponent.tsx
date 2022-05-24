import React, { useContext } from "react";
import { ethers } from "ethers";
import {oracle, marginpool} from "./libs/ContractObjects";
import EVIXContext from "./contexts/EVIXContext";

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
    let newPrice = parseInt(event.target.newPrice.value)*100;
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

  let evixContext = useContext(EVIXContext);

  let oracleCard = (
    <Card style={{ width: "18rem" }} className="me-5 mt-5">
      <Card.Body>
        <Card.Title>Update Oracle</Card.Title>
        <Card.Text>Window for updating Oracle price level</Card.Text>
      </Card.Body>
      <ListGroup className="list-group-flush">
        <ListGroupItem>
          Current EVIX Pool Price:
          {" "}{evixContext.poolEVIXLevel}
        </ListGroupItem>
        <ListGroupItem>
          Current EVIX Index Mark:
          {" "}{evixContext.spotEVIXLevel}
        </ListGroupItem>
        <Card.Body>
          Update EVIX Via Squeeth
          <InputGroup className="mb-3">
            <Button onClick={TriggerSqueethPriceUpdate}>Trigger Update</Button>
          </InputGroup>
        </Card.Body>
      </ListGroup>
      <Card.Body>
        Update EVIX Manually:
        <InputGroup className="mb-3">
          <form onSubmit={ManualUpdateOraclePrice}>
            <input
              id="newPrice"
              type="text"
              placeholder="Level to set EVIX to"
            />
            <Button type={"submit"}>Update EVIX</Button>
          </form>
        </InputGroup>
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
          {" "}{evixContext.poolEVIXLevel}
        </ListGroupItem>
        <ListGroupItem>
          Current EVIX Index Mark:
          {" "}{evixContext.spotEVIXLevel}
        </ListGroupItem>
      </ListGroup>
      <Card.Body>
        Settle Address Funding
        <InputGroup className="mb-3">
          <form onSubmit={SettleAddressFunding}>
            <input id="address" type="text" placeholder="Address to settle" />
            <Button type={"submit"}>Settle Funding</Button>
          </form>
        </InputGroup>
      </Card.Body>
    </Card>
  );

  return (
    <CardGroup>
      {oracleCard}
      {fundingCard}
    </CardGroup>
  );
};
