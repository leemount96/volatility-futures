import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

import { Button, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export const WalletInfo = ({}) => {
  const [data, setdata] = useState({
    address: "",
    Balance: "",
    connected: false,
  });

  const metamaskHandler = () => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((res: any) => accountChangeHandler(res[0]));
    } else {
      alert("Please install metamask extension");
    }
  };

  const getBalance = (address: any) => {
    window.ethereum
      .request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })
      .then((balance: any) => {
        setdata({
          address: address,
          Balance: ethers.utils.formatEther(balance),
          connected: true,
        });
      });
  };

  const accountChangeHandler = (account: any) => {
    setdata({
      address: account,
      Balance: "",
      connected: true,
    });

    getBalance(account);
  };

  let content;

  if (data.connected) {
    content = (
      <Card>
        <Card.Header className="float-end">
          <strong>Address: </strong>
          {data.address}
        </Card.Header>

        <Card.Body>
          <Card.Text>
            <strong>Balance: </strong>
            {data.Balance} ETH
          </Card.Text>
        </Card.Body>
      </Card>
    );
  } else {
    content = (
      <Card>
        <Button onClick={metamaskHandler} variant="primary">
          Connect to wallet
        </Button>
      </Card>
    );
  }

  return <Card className="text-center">{content}</Card>;
};
