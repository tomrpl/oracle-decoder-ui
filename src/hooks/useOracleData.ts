import { useState } from "react";
import { checkWarnings } from "../services/processor";
import { getProvider } from "../services/provider/provider";
import { ErrorTypes, LoadingStates } from "../services/errorTypes";
import { MulticallWrapper } from "ethers-multicall-provider";
import { queryOracleApi } from "../services/fetchers/fetchAPI";
import { getOracleTransactionHash } from "../services/fetchers/fetchTransactionHash";
import { fetchOracleDataFromtx } from "../services/fetchers/oracleFetcher";
import { Provider } from "ethers";
import {
  OracleData,
  getOracleData,
  getSafeOracleData,
} from "../services/decoder/oracleDecoder";

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

const useOracleData = () => {
  const [loadingState, setLoadingState] = useState<LoadingStates>(
    LoadingStates.NOT_STARTED
  );
  const [errors, setErrors] = useState<ErrorTypes[]>([]);
  const [result, setResult] = useState<any>(null);

  const fetchOracleData = async (
    oracleAddress: string,
    collateralAsset: string,
    loanAsset: string,
    options: {
      performDecimalCheck: boolean;
      performPriceCheck: boolean;
      performWarningCheck: boolean;
    },
    chainId: number
  ) => {
    setLoadingState(LoadingStates.LOADING);
    setErrors([]);

    try {
      const provider = MulticallWrapper.wrap(getProvider(chainId));
      const txCreationHash = await getOracleTransactionHash(
        oracleAddress,
        provider,
        chainId
      );

      if (!txCreationHash) {
        setErrors((prevErrors) => [
          ...prevErrors,
          ErrorTypes.MISSING_TRANSACTION_HASH,
        ]);
        setLoadingState(LoadingStates.COMPLETED);
        return;
      }

      const [oracleData, markets, oracleDataList] = await Promise.all([
        fetchOracleDataFromtx(oracleAddress, provider),
        queryOracleApi(oracleAddress, chainId),
        getOracleDataFromTx(txCreationHash, provider),
      ]);

      if (!oracleDataList) {
        setErrors((prevErrors) => [...prevErrors, ErrorTypes.DECODING_ERROR]);
        setLoadingState(LoadingStates.COMPLETED);
        return;
      }

      const correctOracleData = oracleDataList.find(
        (data) =>
          data.baseFeed1 === oracleData?.baseFeed1 &&
          data.baseFeed2 === oracleData?.baseFeed2 &&
          data.quoteFeed1 === oracleData?.quoteFeed1 &&
          data.quoteFeed2 === oracleData?.quoteFeed2
      );

      if (!correctOracleData) {
        setErrors((prevErrors) => [...prevErrors, ErrorTypes.DECODING_ERROR]);
        setLoadingState(LoadingStates.COMPLETED);
        return;
      }

      if (!markets || markets.markets.length === 0) {
        setErrors((prevErrors) => [...prevErrors, ErrorTypes.NO_MARKETS_FOUND]);
        setLoadingState(LoadingStates.COMPLETED);
        return;
      }

      const market = markets.markets.find(
        (market) =>
          market.collateralAsset.symbol === collateralAsset &&
          market.loanAsset.symbol === loanAsset
      );

      if (!market) {
        setErrors((prevErrors) => [
          ...prevErrors,
          ErrorTypes.NO_MATCHING_MARKET,
        ]);
        setLoadingState(LoadingStates.COMPLETED);
        return;
      }

      const baseTokenDecimals = parseInt(correctOracleData.baseTokenDecimals);
      const quoteTokenDecimals = parseInt(correctOracleData.quoteTokenDecimals);

      const result: any = {};

      if (options.performDecimalCheck) {
        const decimalComparison = compareDecimals(
          baseTokenDecimals,
          quoteTokenDecimals,
          market
        );
        result.decimalComparison = decimalComparison;
      }

      if (options.performWarningCheck) {
        const warningCheck = checkWarnings(market);
        result.warningCheck = warningCheck;
      }

      setResult(result);
    } catch (error) {
      setErrors((prevErrors) => [...prevErrors, ErrorTypes.FETCH_ERROR]);
    } finally {
      setLoadingState(LoadingStates.COMPLETED);
    }
  };

  return { loadingState, errors, result, fetchOracleData };
};

export default useOracleData;
