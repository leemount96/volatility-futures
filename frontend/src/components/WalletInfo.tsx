import React, { useContext } from "react";
import UserContext from "./contexts/UserContext";

import { Button, Card } from "react-bootstrap";

export const WalletInfo = () => {
  let content;
  let userContext = useContext(UserContext);

  if (userContext.connected) {
    content = (
      <Card>
        <Card.Header className="float-end">
          <strong>Address: </strong>
          {userContext.walletAddress}
        </Card.Header>

        <Card.Body>
          <Card.Text>
            <strong>Balance: </strong>
            {userContext.ethBalance} ETH
          </Card.Text>
        </Card.Body>
      </Card>
    );
  } else {
    content = (
      <Card>
        <Button onClick={userContext.metamaskHandler} variant="primary">
          Connect to wallet
        </Button>
      </Card>
    );
  }

  return <Card className="text-center">{content}</Card>;
};
