import React from "react";
import "./TradeWindow.css";
import { ethers } from 'ethers';
import oracleJson from "../abis/Oracle.json";

import { Button, Card, ListGroup, ListGroupItem } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// require('dotenv');

const ORACLE_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const oracleAbi = oracleJson.abi;
const oracle = new ethers.Contract(ORACLE_ADDRESS, oracleAbi, ethers.getDefaultProvider("http://localhost:8545"));

const getEVIXIndexMark = async() => {
  const price = await oracle.functions.spotEVIXLevel();
  return price;
}

export const TradeWindowComponent = ({}) => {
    return (
        <Card style={{ width: '18rem' }} className="float-end">
        <Card.Body>
          <Card.Title>Trade EVIX</Card.Title>
          <Card.Text>
            Window for viewing current EVIX stats and trading the perp
          </Card.Text>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem>Available Collateral: </ListGroupItem>
          <ListGroupItem>Current EVIX Pool Price</ListGroupItem>
          <ListGroupItem>Current EVIX Index Mark: </ListGroupItem>
        </ListGroup>
        <Card.Body>
            <Button variant="primary">Buy EVIX</Button>
            <Button variant="primary">Sell EVIX</Button>
        </Card.Body>
      </Card>
      
    )
}