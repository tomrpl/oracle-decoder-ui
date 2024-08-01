import { ethers } from "ethers";

export const getProvider = (chainId: number): ethers.JsonRpcProvider => {
  let endpoint: string | undefined;

  if (chainId === 1) {
    endpoint = process.env.REACT_APP_RPC_URL_MAINNET;
    console.log("chaindId: 1 - Ethereum Mainnet");
  } else if (chainId === 8453) {
    endpoint = process.env.REACT_APP_RPC_URL_BASE;
    console.log("chaindId: 8453 - Base");
  }

  if (!endpoint) {
    console.log("RPC_URL not set. Exiting…");
    process.exit(1);
  }

  if (endpoint) {
    console.log("RPC_URL is set");
  }

  return new ethers.JsonRpcProvider(endpoint);
};
