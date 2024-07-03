import {
  getOracleData,
  getSafeOracleData,
  OracleData,
} from "./decoder/oracleDecoder";
import { Provider } from "ethers";
import { getFeedPrice } from "./fetchers/feedsFetcher";
import { ZeroAddress } from "ethers";
import { queryAssetsPrices } from "./fetchers/fetchAPI";

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
  quoteTokenDecimals: number,
  chainId: number
) => {
  const assetPrices = await queryAssetsPrices(
    chainId,
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

export { compareDecimals, comparePrices, checkWarnings };
