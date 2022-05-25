import React, { ReactNode, FC, useState, useEffect, Dispatch, SetStateAction } from "react";
import { useAccount, useConnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected'

import { marginpool, usdc, vpool } from "../libs/ContractObjects";

interface UserContextValue {
  connected: boolean;
  walletAddress: string;
  ethBalance: string;
  USDCBalance: number;
  depositedCollateral: number;
  tradePosition?: TradePosition;
  LPPosition?: LPPosition;
  setWalletData?: Dispatch<SetStateAction<{ address: string; balance: string; connected: boolean; }>>;
}

interface TradePosition {
  hasTradePosition: boolean;
  EVIXAmount: number;
  fundingPNL: number;
  openingPrice: number;
}

interface LPPosition {
  hasLPPosition: boolean;
  USDCAmount: number;
  EVIXAmount: number;
}

interface props {
  children?: ReactNode;
}

const defaultValue = {
  connected: false,
  walletAddress: "",
  ethBalance: "",
  USDCBalance: 0,
  depositedCollateral: 0,
};

const UserContext = React.createContext<UserContextValue>(defaultValue);

export default UserContext;

export const UserProvider: FC<props> = ({ children }) => {
  const [walletData, setWalletData] = useState({
    address: "",
    balance: "",
    connected: false,
  });

  const { data: account } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })

  const [walletUSDC, updateWalletUSDC] = useState(0);
  const [userCollateral, updateCollateral] = useState(0);
  const [tradePosition, updateTradePosition] = useState<TradePosition>({
    hasTradePosition: false,
    EVIXAmount: 0, 
    fundingPNL: 0, 
    openingPrice: 0
  })
  const [lpPosition, updateLPPosition] = useState<LPPosition>({
    hasLPPosition: false,
    USDCAmount: 0,
    EVIXAmount: 0,
  })

  const getWalletUSDC = async () => {

    let val = await usdc.functions.balanceOf(account!.address);
    updateWalletUSDC(parseInt(val.toString())/10**10);
  };

  const getCollateral = async () => {
    let val = await marginpool.functions.freeCollateralMap(account!.address);
    updateCollateral(parseInt(val.toString())/10**10);
  };

  const getTradePosition = async () => {
    let position = await marginpool.functions.positions(account!.address);
    if (position.amountVPerp.toNumber() !== 0) {
      updateTradePosition({
        hasTradePosition: true,
        EVIXAmount: position.amountVPerp.div(10**8).toNumber(),
        fundingPNL: position.fundingPNL.div(10**10).toNumber(),
        openingPrice: position.tradedPrice.toNumber()/10**2,
      })
    } else {
      updateTradePosition({
        hasTradePosition: false,
        EVIXAmount: 0,
        fundingPNL: 0,
        openingPrice: 0,
      })
    }
  }

  const getLPPosition = async () => {
    let LPPosition = await vpool.functions.getPosition(account!.address);
    LPPosition = LPPosition[0];
    if (LPPosition.amountUSDC.gt(0)){
      updateLPPosition({
        hasLPPosition: true,
        USDCAmount: LPPosition.amountUSDC.div(10**10).toNumber(),
        EVIXAmount: LPPosition.amountVPerp.div(10**8).toNumber(),
      })
    } else {
      updateLPPosition({
        hasLPPosition: false,
        USDCAmount: 0,
        EVIXAmount: 0,
      })
    }
  }

  useEffect(() => {
    // connect();
    const interval = setInterval(async () => {
      // console.log(walletData);
      await getWalletUSDC();
      await getCollateral();
      await getTradePosition();
      await getLPPosition();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  

  return (
    <UserContext.Provider
      value={{
        connected: walletData.connected,
        walletAddress: walletData.address,
        ethBalance: walletData.balance,
        USDCBalance: walletUSDC,
        depositedCollateral: userCollateral,
        tradePosition: tradePosition,
        LPPosition: lpPosition,
        setWalletData: setWalletData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
