import React, { useState } from 'react';
import { ethers } from "ethers";

import { Button, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export const WalletInfo = ({}) => {
    const [data, setdata] = useState({
        address: "",
        Balance: "",
    })

    const metamaskHandler = () => {
        if(window.ethereum){
            window.ethereum.request({method: "eth_requestAccounts" })
            .then((res: any) => accountChangeHandler(res[0]))
        }else{
            alert("Please install metamask extension");
        }
    };

    const getBalance = (address: any) => {
        window.ethereum.request({
            method: "eth_getBalance",
            params: [address, "latest"]
        })
        .then((balance: any) => {
            setdata({
            address: address,
            Balance: ethers.utils.formatEther(balance),
            });
        });
    };

    const accountChangeHandler = (account: any) => {
        setdata({
            address: account,
            Balance: "",
        });

        getBalance(account);
    }

    return (
        <Card className = "text-center">
            <Card.Header className="float-end">
                <strong>Address: </strong>
                {data.address}
            </Card.Header>

            <Card.Body>
                <Card.Text>
                <strong>Balance: </strong>
                {data.Balance} ETH
                </Card.Text>

                <Button onClick={metamaskHandler} variant="primary">
                Connect to wallet
                </Button>
            </Card.Body>
        </Card>
    )
}