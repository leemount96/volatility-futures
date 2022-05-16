import React from "react";
import "./TradeWindow.css";

import { Button, Card, ListGroup, ListGroupItem } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

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
          <ListGroupItem>Current EVIX Pool Price: </ListGroupItem>
          <ListGroupItem>Current EVIX Index Mark: </ListGroupItem>
        </ListGroup>
        <Card.Body>
            <Button variant="primary">Buy EVIX</Button>
            <Button variant="primary">Sell EVIX</Button>
        </Card.Body>
      </Card>
    )
}