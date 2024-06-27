import { ethers } from "ethers";

export const getFeedPrice = async (
  feedAddress: string,
  provider: ethers.Provider
): Promise<{ answer: bigint; decimals: number }> => {
  const feedContract = new ethers.Contract(
    feedAddress,
    [
      "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
      "function decimals() view returns (uint8)",
    ],
    provider
  );

  try {
    const [, answer, , ,] = await feedContract.latestRoundData();

    const decimals = await feedContract.decimals();

    return { answer, decimals: Number(decimals) };
  } catch (error) {
    console.error("Error fetching latestRoundData:", error);
    throw error;
  }
};
