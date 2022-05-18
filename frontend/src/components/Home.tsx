import React, { useState } from "react";
import { ethers } from "ethers";
import usdcJson from "../abis/USDCMock.json";

import {
  Button,
  Card,
  ListGroup,
  ListGroupItem,
  InputGroup,
  FormControl,
} from "react-bootstrap";

const provider = new ethers.providers.Web3Provider(window.ethereum);

const USDC_ADDRESS = process.env.REACT_APP_USDC_ADDRESS!;
const usdcAbi = usdcJson.abi;
const usdc = new ethers.Contract(USDC_ADDRESS, usdcAbi, provider);

const MARGINPOOL_ADDRESS = process.env.REACT_APP_MARGINPOOL_ADDRESS!;
const VPOOL_ADDRESS = process.env.REACT_APP_VPOOL_ADDRESS!;

export const HomeComponent = () => {

    const[depositedUSDC, updateDepositedUSDC] = useState({
        amount: 0,
    })

    const GetDespositedTotal = async () => {
        let valMarginPool = await usdc.functions.balanceOf(MARGINPOOL_ADDRESS);
        let valVPool = await usdc.functions.balanceOf(VPOOL_ADDRESS);
        updateDepositedUSDC({amount: parseInt(valMarginPool.toString()) + parseInt(valVPool.toString())})
    }

    GetDespositedTotal();

  return (
    <Card style={{ width: "18rem" }} className="text-center me-5 mt-5">
      <Card.Body>
        <Card.Title>Total USDC Deposited</Card.Title>
        <Card.Text className="text-center">{depositedUSDC.amount} USDC</Card.Text>
      </Card.Body>
    </Card>
  );
};
