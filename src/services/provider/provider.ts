import { ethers } from "ethers";

export const getProvider = (chainId: number): ethers.JsonRpcProvider => {
  let endpoint: string | undefined;

  if (chainId === 1) {
    endpoint = process.env.REACT_APP_RPC_URL_MAINNET;
  } else if (chainId === 8453) {
    endpoint = process.env.REACT_APP_RPC_URL_BASE;
  }

  if (!endpoint) {
    console.log("RPC_URL not set. Exiting…");
    process.exit(1);
  }

  return new ethers.JsonRpcProvider(endpoint);
};
