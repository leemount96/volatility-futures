import React, { useContext, useState } from "react";
import { marginpool, usdc} from "./libs/ContractObjects";
import UserContext from "./contexts/UserContext";

import {
  Button,
  Card,
  ListGroup,
  ListGroupItem,
  InputGroup,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export const DepositComponent = () => {
  const depositHandler = async (event: any) => {
    event.preventDefault();
    let depositAmount = parseInt(event.target.depositAmount.value)*10**10;
    await usdc.functions.approve(marginpool.address, depositAmount);
    await marginpool.functions.depositCollateral(depositAmount);

    event.target.reset();
  };

  const withdrawHandler = async (event: any) => {
    event.preventDefault();
    let withdrawAmount = parseInt(event.target.withdrawAmount.value)*10**10;
    await marginpool.functions.returnCollateral(withdrawAmount);
    
    event.target.reset();
  };


  let userContext = useContext(UserContext);
  let depositCard;

  if (userContext.depositedCollateral > 0) {
    depositCard = (
      <Card style={{ width: "22rem" }} className="me-5 mt-5">
        <Card.Body>
          <Card.Title>Manage Collateral</Card.Title>
          <Card.Text>Window for manging collateral in margin pool</Card.Text>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem>
            Withdrawable Collateral:
            {" "}{userContext.depositedCollateral.toLocaleString()} USDC
          </ListGroupItem>
        </ListGroup>
        <Card.Body>
          Withdraw Collateral
          <InputGroup className="mb-3">
            <form onSubmit={withdrawHandler}>
              <input
                id="withdrawAmount"
                type="text"
                placeholder="Amount of USDC"
              />
              <Button type={"submit"}>Withdraw </Button>
            </form>
          </InputGroup>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem>
            Available USDC Balance:
            {" "}{userContext.USDCBalance.toLocaleString()} USDC
          </ListGroupItem>
        </ListGroup>
        <Card.Body>
          Deposit USDC
          <InputGroup className="mb-3">
            <form onSubmit={depositHandler}>
              <input
                id="depositAmount"
                type="text"
                placeholder="Amount of USDC"
              />
              <Button type={"submit"}>Deposit </Button>
            </form>
          </InputGroup>
        </Card.Body>
      </Card>
    );
  } else {
    depositCard = (
      <Card style={{ width: "22rem" }} className="me-5 mt-5">
        <Card.Body>
          <Card.Title>Deposit Collateral</Card.Title>
          <Card.Text>Window for depositing USDC as collateral</Card.Text>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem>
            Available USDC Balance:
            {" "}{userContext.USDCBalance.toLocaleString()} USDC
          </ListGroupItem>
        </ListGroup>
        <Card.Body>
          Deposit USDC
          <InputGroup className="mb-3">
            <form onSubmit={depositHandler}>
              <input
                id="depositAmount"
                type="text"
                placeholder="Amount of USDC"
              />
              <Button type={"submit"}>Deposit </Button>
            </form>
          </InputGroup>
        </Card.Body>
      </Card>
    );
  }

  return depositCard;
};
