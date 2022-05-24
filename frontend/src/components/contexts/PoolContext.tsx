import React, { useState, FC, ReactNode, useEffect } from "react";
import { vpool } from "../libs/ContractObjects";

interface PoolContextValue {
  amountEVIX: number;
  amountUSDC: number;
  feeRate: number;
}

interface props {
  children?: ReactNode;
}

const defaultValue = {
  amountEVIX: 0,
  amountUSDC: 0,
  feeRate: 0,
};

const PoolContext = React.createContext<PoolContextValue>(defaultValue);

export default PoolContext;

export const PoolProvider: FC<props> = ({ children }) => {
  const [currentAmounts, setAmounts] = useState({amountEVIX: 0, amountUSDC: 0, feeRate: 0});

  const updateLevels = async () => {
    let amountEVIX = await vpool.functions.poolVPerp();
    let amountUSDC = await vpool.functions.poolUSDC();
    let feeRate = await vpool.functions.feePercentage();
    setAmounts({
        amountEVIX: amountEVIX/10**8,
        amountUSDC: amountUSDC/10**10,
        feeRate: feeRate/10**8,
    });
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      updateLevels();
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  
  return (
    <PoolContext.Provider value={{ 
        amountEVIX: currentAmounts.amountEVIX, 
        amountUSDC: currentAmounts.amountUSDC, 
        feeRate: currentAmounts.feeRate
        }}>
      {children}
    </PoolContext.Provider>
  );
};
