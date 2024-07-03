import { Provider } from "ethers";

// Function to check if an address is in the data
function containsAddress(data: string, address: string): boolean {
  const addressWithoutPrefix = address.toLowerCase().substring(2);
  return data.toLowerCase().includes(addressWithoutPrefix);
}

// Define starting block numbers for different networks
const startingBlocks: Record<number, number> = {
  1: 18000000, // Mainnet
  8453: 13978286, // Base
};

// Define oracle factory addresses for different networks
const factoryAddresses: Record<number, string> = {
  1: "0x3A7bB36Ee3f3eE32A60e9f2b33c1e5f2E83ad766",
  8453: "0x2DC205F24BCb6B311E5cdf0745B0741648Aebd3d",
};

// Function to get the oracle's transaction hash
export async function getOracleTransactionHash(
  oracleAddress: string,
  provider: Provider,
  chainId: number
): Promise<string | null> {
  // Get the starting block for the specified chainId
  const fromBlock = startingBlocks[chainId];
  const address = factoryAddresses[chainId];

  if (fromBlock === undefined || address === undefined) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }

  const filter = {
    address,
    fromBlock,
    toBlock: "latest",
  };

  // Fetch logs
  const logs = await provider.getLogs(filter);

  // Find the first log containing the oracle address
  const log = logs.find((log: any) => containsAddress(log.data, oracleAddress));

  // Return the transaction hash if found, otherwise null
  return log ? log.transactionHash : null;
}
