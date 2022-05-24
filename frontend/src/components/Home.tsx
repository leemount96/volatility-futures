import React, { useContext, useEffect, useState } from "react";

import { vpool, marginpool, usdc } from "./libs/ContractObjects";

import { Card } from "react-bootstrap";

import EVIXContext from "./contexts/EVIXContext";


export const HomeComponent = () => {
  const [depositedUSDC, updateDepositedUSDC] = useState({
    amount: 0,
  });

  const getDespositedTotal = async () => {
    let valMarginPool = await usdc.functions.balanceOf(marginpool.address);
    let valVPool = await usdc.functions.balanceOf(vpool.address);
    updateDepositedUSDC({
      amount:
        (parseInt(valMarginPool.toString()) + parseInt(valVPool.toString()))/10**10,
    });
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      getDespositedTotal();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  let evixContext = useContext(EVIXContext);

  return (
    <Card style={{ width: "18rem" }} className="text-center me-5 mt-5">
      <Card.Body>
        <Card.Title>Total USDC Deposited</Card.Title>
        <Card.Text className="text-center">
          {depositedUSDC.amount.toLocaleString()} USDC
        </Card.Text>
      </Card.Body>
      <Card.Body>
        <Card.Title>Current EVIX Index Level</Card.Title>
        <Card.Text className="text-center">
          {evixContext.spotEVIXLevel.toLocaleString()}
        </Card.Text>
      </Card.Body>
      <Card.Body>
        <Card.Title>Current EVIX Pool Price</Card.Title>
        <Card.Text className="text-center">
          {evixContext.poolEVIXLevel.toLocaleString()}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};
