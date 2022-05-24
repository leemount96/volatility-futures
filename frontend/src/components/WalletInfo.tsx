import React, { useContext } from "react";
import UserContext from "./contexts/UserContext";
import { ethers } from "ethers";
import { useAccount, useConnect, useEnsName } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

import { Button, Card } from "react-bootstrap";

export const WalletInfo = () => {
  const { data: account } = useAccount()
  // const { data: ensName } = useEnsName({ address: account!.address })
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })

  if (account) return (
  <div>Connected to: {account.address}</div>

  
  )
  return <Button onClick={() => connect()}>Connect Wallet</Button>
}
// export const WalletInfo = () => {
//   let content;
//   let userContext = useContext(UserContext);

//   const metamaskHandler = () => {
//     if (window.ethereum) {
//       window.ethereum
//         .request({ method: "eth_requestAccounts" })
//         .then((res: any) => accountChangeHandler(res[0]));
//     } else {
//       alert("Please install metamask extension");
//     }
//   };

//   const getBalance = (address: any) => {
//     window.ethereum
//       .request({
//         method: "eth_getBalance",
//         params: [address, "latest"],
//       })
//       .then((balance: any) => {
//         userContext.setWalletData!({
//           address: address,
//           balance: ethers.utils.formatEther(balance),
//           connected: true,
//         });
//       });
//   };

//   const accountChangeHandler = (account: any) => {

//     userContext.setWalletData!({
//       address: account,
//       balance: "",
//       connected: true,
//     });

//     getBalance(account);
//   };

//   if (userContext.connected) {
//     content = (
      // <Card>
      //   <Card.Header className="float-end">
      //     <strong>Address: </strong>
      //     {userContext.walletAddress}
      //   </Card.Header>

      //   <Card.Body>
      //     <Card.Text>
      //       <strong>Balance: </strong>
      //       {userContext.ethBalance} ETH
      //     </Card.Text>
      //   </Card.Body>
      // </Card>
//     );
//   } else {
//     content = (
//       <Card>
//         <Button onClick={metamaskHandler} variant="primary">
//           Connect to wallet
//         </Button>
//       </Card>
//     );
//   }

//   return <Card className="text-center">{content}</Card>;
// };
