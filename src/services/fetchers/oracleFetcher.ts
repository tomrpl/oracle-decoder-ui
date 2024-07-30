import { ethers, Provider } from "ethers";
import { OracleInputs } from "../../hooks/types";
import { queryOracles } from "./fetchAPI";

interface OracleReadData {
  priceUnscaled: number;
  price: bigint;
  scaleFactor: bigint;
  baseFeed1: string;
  baseFeed2: string;
  baseVault: string;
  baseVaultConversionSample: bigint;
  quoteFeed1: string;
  quoteFeed2: string;
  quoteVault: string;
  quoteVaultConversionSample: bigint;
}

export const fetchOracleDataFromtx = async (
  oracleAddress: string,
  provider: Provider
): Promise<OracleReadData | null> => {
  const oracleContract = new ethers.Contract(
    oracleAddress,
    [
      "function price() view returns (uint256)",
      "function SCALE_FACTOR() view returns (uint256)",
      "function BASE_FEED_1() view returns (address)",
      "function BASE_FEED_2() view returns (address)",
      "function BASE_VAULT() view returns (address)",
      "function BASE_VAULT_CONVERSION_SAMPLE() view returns (uint256)",
      "function QUOTE_FEED_1() view returns (address)",
      "function QUOTE_FEED_2() view returns (address)",
      "function QUOTE_VAULT() view returns (address)",
      "function QUOTE_VAULT_CONVERSION_SAMPLE() view returns (uint256)",
    ],
    provider
  );

  try {
    const [
      price,
      scaleFactor,
      baseFeed1,
      baseFeed2,
      baseVault,
      baseVaultConversionSample,
      quoteFeed1,
      quoteFeed2,
      quoteVault,
      quoteVaultConversionSample,
    ] = await Promise.all([
      oracleContract.price(),
      oracleContract.SCALE_FACTOR(),
      oracleContract.BASE_FEED_1(),
      oracleContract.BASE_FEED_2(),
      oracleContract.BASE_VAULT(),
      oracleContract.BASE_VAULT_CONVERSION_SAMPLE(),
      oracleContract.QUOTE_FEED_1(),
      oracleContract.QUOTE_FEED_2(),
      oracleContract.QUOTE_VAULT(),
      oracleContract.QUOTE_VAULT_CONVERSION_SAMPLE(),
    ]);

    return {
      priceUnscaled: Number(BigInt(price)) / Number(BigInt(scaleFactor)),
      price: BigInt(price),
      scaleFactor: BigInt(scaleFactor),
      baseFeed1,
      baseFeed2,
      baseVault,
      baseVaultConversionSample: BigInt(baseVaultConversionSample),
      quoteFeed1,
      quoteFeed2,
      quoteVault,
      quoteVaultConversionSample: BigInt(quoteVaultConversionSample),
    };
  } catch (error) {
    console.error("Error fetching oracle data:", error);
    return null;
  }
};

export const checkOracleDeployment = async (
  chainId: number,
  oracleInputs: OracleInputs
) => {
  const oracles = await queryOracles(chainId);

  for (const oracle of oracles) {
    if (
      oracle.data.baseVault === oracleInputs.baseVault &&
      oracle.data.quoteVault === oracleInputs.quoteVault &&
      oracle.data.baseFeedOne.address === oracleInputs.baseFeed1 &&
      oracle.data.baseFeedTwo.address === oracleInputs.baseFeed2 &&
      oracle.data.quoteFeedOne.address === oracleInputs.quoteFeed1 &&
      oracle.data.quoteFeedTwo.address === oracleInputs.quoteFeed2 &&
      BigInt(oracle.data.baseVaultConversionSample) ===
        BigInt(oracleInputs.baseVaultConversionSample) &&
      BigInt(oracle.data.quoteVaultConversionSample) ===
        BigInt(oracleInputs.quoteVaultConversionSample)
    ) {
      return {
        isDeployed: true,
        address: oracle.address,
      };
    }
  }

  return {
    isDeployed: false,
    address: null,
  };
};
