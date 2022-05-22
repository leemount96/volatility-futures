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
  CardGroup,
} from "react-bootstrap";

let provider;
let signer;

if (window.ethereum) {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
}

const ORACLE_ADDRESS = process.env.REACT_APP_ORACLE_ADDRESS!;
const oracleAbi = oracleJson.abi;
const oracle = new ethers.Contract(ORACLE_ADDRESS, oracleAbi, signer);

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

export const AdminComponent = () => {
  const [EVIXOraclePrice, updateEVIXOraclePrice] = useState();
  const [EVIXPoolPrice, updateEVIXPoolPrice] = useState();

  const GetEVIXIndexMark = async () => {
    let val = await oracle.functions.spotEVIXLevel();
    updateEVIXOraclePrice(val.toString());
  };

  const GetEVIXPoolPrice = async () => {
    let val = await vpool.functions.price();
    updateEVIXPoolPrice(val.toString());
  };

  const ManualUpdateOraclePrice = async (event: any) => {
    event.preventDefault();
    let newPrice = parseInt(event.target.newPrice.value);
    await oracle.functions.manualUpdateSpotLevel(newPrice);
    await GetEVIXIndexMark();
  };

  const TriggerSqueethPriceUpdate = async (event: any) => {
    // event.preventDefault();
    // let curNorm = ethers.BigNumber.from(event.target.curNorm.value);
    // let expNorm = ethers.BigNumber.from(event.target.expNorm.value);
    let curNorm = ethers.BigNumber.from("661952215156645403")
    let expNorm = ethers.BigNumber.from("662357433446515165");
    await oracle.functions.updateSpotFromSqueeth(curNorm, expNorm);
    await GetEVIXIndexMark();
  };

  const SettleAddressFunding = async (event: any) => {
    event.preventDefault();
    let address = event.target.address.value;
    await marginpool.functions._settleFunding(address);
  };

  GetEVIXIndexMark();
  GetEVIXPoolPrice();

  let oracleCard = (
    <Card style={{ width: "18rem" }} className="me-5 mt-5">
      <Card.Body>
        <Card.Title>Update Oracle</Card.Title>
        <Card.Text>Window for updating Oracle price level</Card.Text>
      </Card.Body>
      <ListGroup className="list-group-flush">
        <ListGroupItem>
          Current EVIX Pool Price:
          {" "}{EVIXPoolPrice}
        </ListGroupItem>
        <ListGroupItem>
          Current EVIX Index Mark:
          {" "}{EVIXOraclePrice}
        </ListGroupItem>
        <Card.Body>
          Update EVIX Via Squeeth
          <InputGroup className="mb-3">
            {/* <form onSubmit={TriggerSqueethPriceUpdate}>
              <input
                id="curNorm"
                type="text"
                placeholder="Normalization Factor"
              />
              <input
                id="expNorm"
                type="text"
                placeholder="Expected Normalization"
              />
              <Button type={"submit"}>Update EVIX</Button>
            </form> */}
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
        <Card.Text>Window for settling funding for an address</Card.Text>
      </Card.Body>
      <ListGroup className="list-group-flush">
        <ListGroupItem>
          Current EVIX Pool Price:
          {" "}{EVIXPoolPrice}
        </ListGroupItem>
        <ListGroupItem>
          Current EVIX Index Mark:
          {" "}{EVIXOraclePrice}
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
