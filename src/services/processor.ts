import {
  getOracleData,
  getSafeOracleData,
  OracleData,
} from "./decoder/oracleDecoder";
import { MulticallWrapper } from "ethers-multicall-provider";
import { ethers, Provider } from "ethers";
import { getFeedPrice } from "./fetchers/feedsFetcher";
import { ZeroAddress } from "ethers";
import { fetchOracleData } from "./fetchers/oracleFetcher";
import { queryOracleApi, queryAssetsPrices } from "./fetchers/fetchAPI";
import { getOracleTransactionHash } from "./fetchers/fetchTransactionHash";

const rpcUrl = process.env.REACT_APP_RPC_URL;

export const getProvider = (endpoint?: string) => {
  if (!endpoint) {
    endpoint = rpcUrl; // Use the environment variable
    if (!endpoint) {
      console.log("RPC_URL not set. Exiting…");
      process.exit(1);
    }
  }
  return new ethers.JsonRpcProvider(endpoint);
};

export const getOracleDataFromTx = async (
  txCreation: string,
  provider: Provider
): Promise<OracleData[] | null> => {
  try {
    const tx = await provider.getTransaction(txCreation);
    if (tx) {
      let oracleDataList: OracleData[] = [];
      const oracleData = getOracleData(tx.data);
      if (!oracleData) {
        console.log(
          "The transaction has been executed by safe or a foundry script. Trying safe decoding"
        );
        const safeOracleData = getSafeOracleData(tx.data);
        if (safeOracleData.length > 0) {
          oracleDataList = safeOracleData.filter(
            (data) => data !== null
          ) as OracleData[];
        }
      } else {
        oracleDataList.push(oracleData);
      }
      return oracleDataList.length > 0 ? oracleDataList : null;
    }
    return null;
  } catch (error) {
    console.error("Failed to get Oracle Data:", error);
    return null;
  }
};

// eslint-disable-next-line
const fetchFeedPrices = async (
  oracleDataList: OracleData[],
  provider: Provider
) => {
  const prices: {
    baseFeed1?: { answer: bigint; decimals: number } | null;
    baseFeed2?: { answer: bigint; decimals: number } | null;
    quoteFeed1?: { answer: bigint; decimals: number } | null;
    quoteFeed2?: { answer: bigint; decimals: number } | null;
  } = {};

  await Promise.all(
    oracleDataList.map(async (oracleData) => {
      if (oracleData.baseFeed1 !== ZeroAddress) {
        prices.baseFeed1 = await getFeedPrice(oracleData.baseFeed1, provider);
      }
      if (oracleData.baseFeed2 !== ZeroAddress) {
        prices.baseFeed2 = await getFeedPrice(oracleData.baseFeed2, provider);
      }
      if (oracleData.quoteFeed1 !== ZeroAddress) {
        prices.quoteFeed1 = await getFeedPrice(oracleData.quoteFeed1, provider);
      }
      if (oracleData.quoteFeed2 !== ZeroAddress) {
        prices.quoteFeed2 = await getFeedPrice(oracleData.quoteFeed2, provider);
      }
    })
  );

  return prices;
};

const calculatePercentageDifference = (
  value1: number,
  value2: number
): number => {
  return Math.abs((value1 - value2) / value1) * 100;
};

const compareDecimals = (
  baseTokenDecimals: number,
  quoteTokenDecimals: number,
  market: any
) => {
  const baseTokenMarketDecimals = market.collateralAsset.decimals;
  const quoteTokenMarketDecimals = market.loanAsset.decimals;

  const isVerified =
    baseTokenMarketDecimals === baseTokenDecimals &&
    quoteTokenMarketDecimals === quoteTokenDecimals;

  return {
    isVerified,
    baseTokenDecimalsProvided: baseTokenDecimals,
    baseTokenDecimalsExpected: baseTokenMarketDecimals,
    quoteTokenDecimalsProvided: quoteTokenDecimals,
    quoteTokenDecimalsExpected: quoteTokenMarketDecimals,
  };
};

const comparePrices = async (
  oracleData: any,
  market: any,
  baseTokenDecimals: number,
  quoteTokenDecimals: number
) => {
  const assetPrices = await queryAssetsPrices(
    1,
    market.collateralAsset.symbol,
    market.loanAsset.symbol
  );
  const collateralAssetPrice =
    assetPrices[market.collateralAsset.symbol]?.priceUsd;
  const loanAssetPrice = assetPrices[market.loanAsset.symbol]?.priceUsd;

  if (collateralAssetPrice == null || loanAssetPrice == null) {
    return {
      isVerified: false,
      reconstructedPrice: null,
      oraclePrice: oracleData?.priceUnscaled,
    };
  }

  const reconstructedPrice = parseFloat(
    (
      BigInt(
        Math.round(
          collateralAssetPrice * 10 ** (baseTokenDecimals - quoteTokenDecimals)
        )
      ) * BigInt(Math.round(loanAssetPrice))
    ) // /  BigInt(10 ** quoteTokenDecimals)
      .toString()
  );
  const percentageDiff = calculatePercentageDifference(
    Number(oracleData?.priceUnscaled),
    reconstructedPrice
  );

  return {
    isVerified: percentageDiff <= 20,
    reconstructedPrice,
    oraclePrice: oracleData?.priceUnscaled,
  };
};

const criticalWarnings = [
  "unrecognized_oracle",
  "unrecognized_oracle_feed",
  "hardcoded_oracle_feed",
  "hardcoded_oracle",
  "incompatible_oracle_feeds",
  "incorrect_collateral_exchange_rate",
  "incorrect_loan_exchange_rate",
];

const checkWarnings = (market: any) => {
  const warnings = market.warnings.filter((warning: { type: string }) =>
    criticalWarnings.includes(warning.type)
  );

  return {
    isVerified: warnings.length === 0,
    warnings: warnings,
  };
};

const processOracleData = async (
  oracleAddress: string,
  collateralAsset: string,
  loanAsset: string,
  options: {
    performDecimalCheck: boolean;
    performPriceCheck: boolean;
    performWarningCheck: boolean;
  }
) => {
  const provider = MulticallWrapper.wrap(getProvider(rpcUrl));
  const txCreationHash = await getOracleTransactionHash(
    oracleAddress,
    provider
  );
  if (!txCreationHash) {
    console.log("Failed to get transaction hash for the oracle.");
    return null;
  }
  let result: any = {};

  try {
    const [oracleData, markets, oracleDataList] = await Promise.all([
      fetchOracleData(oracleAddress, provider),
      queryOracleApi(oracleAddress, 1),
      getOracleDataFromTx(txCreationHash, provider),
    ]);

    if (!oracleDataList) {
      console.log("Failed to decode Oracle Data.");
      return null;
    }

    const correctOracleData = oracleDataList.find(
      (data) =>
        data.baseFeed1 === oracleData?.baseFeed1 &&
        data.baseFeed2 === oracleData?.baseFeed2 &&
        data.quoteFeed1 === oracleData?.quoteFeed1 &&
        data.quoteFeed2 === oracleData?.quoteFeed2
    );

    if (!correctOracleData) {
      console.log("Correct Oracle Data not found.");
      return null;
    }

    if (!markets || markets.markets.length === 0) {
      console.log("No markets found in API for the given oracle.");
      return null;
    }

    const market = markets.markets.find(
      (market) =>
        market.collateralAsset.symbol === collateralAsset &&
        market.loanAsset.symbol === loanAsset
    );

    if (!market) {
      console.log("No matching market found for the provided assets.");
      return null;
    }

    const baseTokenDecimals = parseInt(correctOracleData.baseTokenDecimals);
    const quoteTokenDecimals = parseInt(correctOracleData.quoteTokenDecimals);

    if (options.performDecimalCheck) {
      const decimalComparison = compareDecimals(
        baseTokenDecimals,
        quoteTokenDecimals,
        market
      );
      result.decimalComparison = decimalComparison;
    }

    if (options.performPriceCheck) {
      const priceComparison = await comparePrices(
        oracleData,
        market,
        baseTokenDecimals,
        quoteTokenDecimals
      );
      result.priceComparison = priceComparison;
    }

    if (options.performWarningCheck) {
      const warningCheck = checkWarnings(market);
      result.warningCheck = warningCheck;
    }

    return result;
  } catch (error) {
    console.log("Error processing oracle data:", error);
    return { error: true };
  }
};

// Example usage

// const oracleAddress = "0x90CFE73B913ee1B93EA75Aa47134b7330289a458";
// processOracleData(oracleAddress, txCreation, "weETH", "USDC");

// const oracleAddress = "0x5D916980D5Ae1737a8330Bf24dF812b2911Aae25";
// processOracleData(oracleAddress, txCreation, "sUSDe", "DAI");

// const oracleAddress = "0x2b6eFE10F7C7c0f2fD172213ad99017855a8E512";
// processOracleData(oracleAddress, txCreation, "LINK", "USDC");

export { processOracleData };
