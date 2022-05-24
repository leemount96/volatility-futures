import React from "react";
import { useAccount, useConnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

import { Button } from "react-bootstrap";

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