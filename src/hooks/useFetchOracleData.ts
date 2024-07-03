import { useState } from "react";
import { fetchOracleDataFromtx } from "../services/fetchers/oracleFetcher";
import { queryOracleApi } from "../services/fetchers/fetchAPI";
import { getOracleTransactionHash } from "../services/fetchers/fetchTransactionHash";
import { getOracleDataFromTx } from "../services/processor";
import { getProvider } from "../services/provider/provider";
import { MulticallWrapper } from "ethers-multicall-provider";
import { ErrorTypes, LoadingStates } from "../services/errorTypes";

const useFetchOracleData = () => {
  const [loadingState, setLoadingState] = useState<LoadingStates>(
    LoadingStates.NOT_STARTED
  );
  const [errors, setErrors] = useState<ErrorTypes[]>([]);
  const [oracleData, setOracleData] = useState<any>(null);
  const [marketData, setMarketData] = useState<any>(null);

  const fetchOracleDataDetails = async (
    oracleAddress: string,
    chainId: number
  ) => {
    setLoadingState(LoadingStates.LOADING);
    setErrors([]);
    console.log("Starting fetchOracleDataDetails for network:", chainId);
    try {
      const provider = MulticallWrapper.wrap(getProvider(chainId));
      console.log("Provider initialized for network:", chainId);

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
      console.log("Transaction Hash:", txCreationHash);

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
        (data: any) =>
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

      setOracleData(correctOracleData);
      setMarketData(markets);
      console.log("Fetched Oracle Data:", correctOracleData);
      console.log("Fetched Market Data:", markets);
      console.log("Fetched Oracle Data List:", oracleDataList);
    } catch (error) {
      console.error("Error fetching oracle data:", error);
      setErrors((prevErrors) => [...prevErrors, ErrorTypes.FETCH_ERROR]);
    } finally {
      setLoadingState(LoadingStates.COMPLETED);
    }
  };

  return {
    loadingState,
    errors,
    oracleData,
    marketData,
    fetchOracleDataDetails,
  };
};

export default useFetchOracleData;
