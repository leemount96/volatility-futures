import React, { useEffect, useState, Component } from "react";
import { ethers } from 'ethers';
import oracleJson from "../abis/Oracle.json";

import { Button, Card, ListGroup, ListGroupItem } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const ORACLE_ADDRESS = process.env.REACT_APP_ORACLE_ADDRESS!;
const oracleAbi = oracleJson.abi;
const oracle = new ethers.Contract(ORACLE_ADDRESS, oracleAbi, ethers.getDefaultProvider("http://localhost:8545"));

const TradeWindowComponent = () => {

    const GetEVIXIndexMark = () => {
        const [data, updateData] = useState();
        useEffect(() => {
            const getData = async () => {
                const resp = await oracle.functions.spotEVIXLevel();
                const json = await resp.json();
                updateData(json);
            }
            getData();
        }, []);
        return data && <Component data={data} />;
    }

    return (
        <Card style={{ width: '18rem' }} className="float-end me-5 mt-5">
        <Card.Body>
          <Card.Title>Trade EVIX</Card.Title>
          <Card.Text>
            Window for viewing current EVIX stats and trading the perp
          </Card.Text>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem>Available Collateral: </ListGroupItem>
          <ListGroupItem>Current EVIX Pool Price</ListGroupItem>
          <ListGroupItem>Current EVIX Index Mark:</ListGroupItem>
        </ListGroup>
        <Card.Body>
            <Button variant="primary">Buy EVIX</Button>
            <Button variant="danger" className="float-end">Sell EVIX</Button>
        </Card.Body>
      </Card>
      
    )
}

export default TradeWindowComponent;