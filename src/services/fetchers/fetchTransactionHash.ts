import { Provider } from "ethers";

// Function to check if an address is in the data
function containsAddress(data: string, address: string): boolean {
  const addressWithoutPrefix = address.toLowerCase().substring(2);
  return data.toLowerCase().includes(addressWithoutPrefix);
}

// Function to get the oracle's transaction hash
export async function getOracleTransactionHash(
  oracleAddress: string,
  provider: Provider
): Promise<string | null> {
  const filter = {
    address: "0x3A7bB36Ee3f3eE32A60e9f2b33c1e5f2E83ad766",
    fromBlock: 18000000,
    toBlock: "latest",
  };

  // Fetch logs
  const logs = await provider.getLogs(filter);

  // Find the first log containing the oracle address
  const log = logs.find((log: any) => containsAddress(log.data, oracleAddress));

  // Return the transaction hash if found, otherwise null
  return log ? log.transactionHash : null;
}
