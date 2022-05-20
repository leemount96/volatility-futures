import React, { useState } from "react";
import { ethers } from "ethers";
import marginpoolJson from "../abis/PerpMarginPool.json";
import usdcJson from "../abis/USDCMock.json";

import {
  Button,
  Card,
  ListGroup,
  ListGroupItem,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const MARGINPOOL_ADDRESS = process.env.REACT_APP_MARGINPOOL_ADDRESS!;
const marginpoolAbi = marginpoolJson.abi;
const marginpool = new ethers.Contract(
  MARGINPOOL_ADDRESS,
  marginpoolAbi,
  signer
);

const USDC_ADDRESS = process.env.REACT_APP_USDC_ADDRESS!;
const usdcAbi = usdcJson.abi;
const usdc = new ethers.Contract(USDC_ADDRESS, usdcAbi, signer);

export const DepositComponent = () => {
  const [connectedAddress, updateConnectedAddress] = useState({
    address: "",
  });

  const [collateralAmount, updateCollateralAmount] = useState({
    amount: 0,
  });

  const [walletUSDC, updateWalletUSDC] = useState({
    amount: 0,
  });

  const GetCollateral = async () => {
    let val = await marginpool.functions.freeCollateralMap(connectedAddress);
    updateCollateralAmount({ amount: parseInt(val.toString()) });
  };

  const GetWalletUSDC = async () => {
    let val = await usdc.functions.balanceOf(connectedAddress);
    updateWalletUSDC({ amount: parseInt(val.toString()) });
  };

  const GetConnectedWalletAddress = async () => {
    window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then((res: any) => updateConnectedAddress(res[0]));
  };

  const depositHandler = async (event: any) => {
    event.preventDefault();
    let depositAmount = parseInt(event.target.depositAmount.value);
    await usdc.functions.approve(marginpool.address, depositAmount);
    await marginpool.functions.depositCollateral(depositAmount);
    GetCollateral();
  };

  const withdrawHandler = async (event: any) => {
    event.preventDefault();
    let withdrawAmount = parseInt(event.target.withdrawAmount.value);
    marginpool.functions.returnCollateral(withdrawAmount);
    GetCollateral();
  };

  GetConnectedWalletAddress();
  GetWalletUSDC();
  GetCollateral();

  let depositCard;

  if (collateralAmount.amount > 0) {
    depositCard = (
      <Card style={{ width: "18rem" }} className="me-5 mt-5">
        <Card.Body>
          <Card.Title>Manage Collateral</Card.Title>
          <Card.Text>Window for manging collateral in margin pool</Card.Text>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem>
            Withdrawable Collateral:
            {collateralAmount.amount}
          </ListGroupItem>
        </ListGroup>
        <Card.Body>
          Withdraw Colateral
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
            {walletUSDC.amount}
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
      <Card style={{ width: "18rem" }} className="me-5 mt-5">
        <Card.Body>
          <Card.Title>Deposit Collateral</Card.Title>
          <Card.Text>Window for depositing USDC as collateral</Card.Text>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroupItem>
            Available USDC Balance:
            {walletUSDC.amount}
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
