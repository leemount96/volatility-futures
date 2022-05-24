import React, { useContext } from "react";
import { marginpool, usdc} from "./libs/ContractObjects";
import UserContext from "./contexts/UserContext";
import "./ComponentStyling.css";

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
      <Card style={{ width: "25rem" }} className="me-5 mt-5">
        <Card.Body>
          <Card.Title>Manage Collateral</Card.Title>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem>
            Withdrawable Collateral:
            <Card.Text className="DataField">{" "}{userContext.depositedCollateral.toLocaleString()} USDC</Card.Text>
          </ListGroupItem>
        </ListGroup>
        <Card.Body>
          Withdraw Collateral
            <form onSubmit={withdrawHandler}>
              <input
                id="withdrawAmount"
                type="text"
                placeholder="Amount of USDC"
              />
              <Button className="DataField" type={"submit"}>Withdraw </Button>
            </form>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem>
            Available USDC Balance:
            <Card.Text className="DataField">{" "}{userContext.USDCBalance.toLocaleString()} USDC</Card.Text>
          </ListGroupItem>
        </ListGroup>
        <Card.Body>
          Deposit USDC
            <form onSubmit={depositHandler}>
              <input
                id="depositAmount"
                type="text"
                placeholder="Amount of USDC"
              />
              <Button className="DataField" type={"submit"}>Deposit </Button>
            </form>
        </Card.Body>
      </Card>
    );
  } else {
    depositCard = (
      <Card style={{ width: "25rem" }} className="me-5 mt-5">
        <Card.Body>
          <Card.Title>Deposit Collateral</Card.Title>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem>
            Available USDC Balance:
            <Card.Text className="DataField">{" "}{userContext.USDCBalance.toLocaleString()} USDC</Card.Text>
          </ListGroupItem>
        </ListGroup>
        <Card.Body>
          Deposit USDC
            <form onSubmit={depositHandler}>
              <input
                id="depositAmount"
                type="text"
                placeholder="Amount of USDC"
              />
              <Button className="DataField" type={"submit"}>Deposit </Button>
            </form>
        </Card.Body>
      </Card>
    );
  }

  return depositCard;
};
