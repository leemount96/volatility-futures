import React, { ReactNode, FC, useState, useEffect } from "react";
import { ethers } from "ethers";
import { marginpool, usdc, vpool } from "../libs/ContractObjects";

interface UserContextValue {
  connected: boolean;
  walletAddress: string;
  ethBalance: string;
  USDCBalance: number;
  depositedCollateral: number;
  tradePosition?: TradePosition;
  LPPosition?: LPPosition;
  metamaskHandler?: () => void;
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
        setWalletData({
          address: address,
          balance: ethers.utils.formatEther(balance),
          connected: true,
        });
      });
  };

  const accountChangeHandler = (account: any) => {
    // console.log(account);
    setWalletData({
      address: account,
      balance: "",
      connected: true,
    });

    getBalance(account);
  };

  const getWalletUSDC = async () => {
    let val = await usdc.functions.balanceOf(walletData.address);
    updateWalletUSDC(parseInt(val.toString())/10**10);
  };

  const getCollateral = async () => {
    let val = await marginpool.functions.freeCollateralMap(walletData.address);
    updateCollateral(parseInt(val.toString())/10**10);
  };

  const getTradePosition = async () => {
    let position = await marginpool.functions.positions(walletData.address);
    if (position.amountVPerp.toNumber() !== 0) {
      updateTradePosition({
        hasTradePosition: true,
        EVIXAmount: position.amountVPerp.toNumber()/10**8,
        fundingPNL: position.fundingPNL.toNumber()/10**10,
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
    let LPPosition = await vpool.functions.getPosition(walletData.address);
    LPPosition = LPPosition[0];
    if (LPPosition.amountUSDC.toNumber() > 0){
      updateLPPosition({
        hasLPPosition: true,
        USDCAmount: LPPosition.amountUSDC.toNumber()/10**10,
        EVIXAmount: LPPosition.amountVPerp.toNumber()/10**8,
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
    const interval = setInterval(async () => {
      // console.log(walletData);
      getWalletUSDC();
      getCollateral();
      getTradePosition();
      getLPPosition();
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
        metamaskHandler: metamaskHandler,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
