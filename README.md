# EVIX: A DeFi Volatility Trading Primitive

A decentralized volatility trading primitive to allow traders to gain direct exposure to implied volatility movements.

To run:
In the base directory, first need to download dependencies:
```shell
npm install
```

Next, will need to start a local hardhat network:
```shell
npx hardhat node
```

In a new terminal window, cd to scripts directory, in the mainDeploy.js file first need to set METAMASK_PUBKEY to your pubkey, then run:
```shell
npx hardhat run mainDeploy.js --network localhost 
```
The above will deploy the needed smart contracts and give us their addresses, now we will spin up the frontend

cd to the frontend directory and create a new .env file, in that file we will need to add the following:
```shell
REACT_APP_USDC_ADDRESS=0x...
REACT_APP_ORACLE_ADDRESS=0x...
REACT_APP_VPOOL_ADDRESS=0x...
REACT_APP_MARGINPOOL_ADDRESS=0x...
REACT_APP_METAMASK_PUBKEY=0x(your metamask pubkey)
```

After that is done, we need to download dependencies again, then start our node server
```shell
npm install
npm run start
```

This should launch a window with the frontend, you will need to change your metamask to point to the localhost network (should be on port 8545)