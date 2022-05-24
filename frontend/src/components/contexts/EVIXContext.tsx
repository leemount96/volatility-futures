import React, { useState, FC, ReactNode, useEffect } from "react";
import { oracle, vpool } from "../libs/ContractObjects";

interface EVIXContextValue {
  spotEVIXLevel: number;
  poolEVIXLevel: number;
}

interface props {
  children?: ReactNode;
}

const defaultValue = {
  spotEVIXLevel: 0,
  poolEVIXLevel: 0,
};

const EVIXContext = React.createContext<EVIXContextValue>(defaultValue);

export default EVIXContext;

export const EVIXProvider: FC<props> = ({ children }) => {
  const [currentLevels, setLevels] = useState({spotEVIXLevel: 0, poolEVIXLevel: 0});

  const updateLevels = async () => {
    let oracleVal = await oracle.functions.spotEVIXLevel();
    let poolVal = await vpool.functions.price();
    setLevels({
        spotEVIXLevel: oracleVal[0].toNumber()/100,
        poolEVIXLevel: poolVal[0].toNumber()/100
    });
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      updateLevels();
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  
  return (
    <EVIXContext.Provider value={{ 
        spotEVIXLevel: currentLevels.spotEVIXLevel, 
        poolEVIXLevel: currentLevels.poolEVIXLevel, 
        }}>
      {children}
    </EVIXContext.Provider>
  );
};
