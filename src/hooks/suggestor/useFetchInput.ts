import { useState } from "react";
import { ErrorTypes, ErrorMessages } from "../../services/errorTypes";

interface FetchInputParams {
  collateral: string;
  loan: string;
  networkId: number;
  assets: { value: string; label: string; decimals: number }[];
}

interface FetchInputResult {
  baseVault: string;
  baseVaultConversionSample: number;
  baseFeed1: string;
  baseFeed2: string;
  baseTokenDecimals: number;
  quoteVault: string;
  quoteVaultConversionSample: number;
  quoteFeed1: string;
  quoteFeed2: string;
  quoteTokenDecimals: number;
  salt: string;
}

const fetchFeeds = async ({
  collateral,
  loan,
  networkId,
  assets,
}: FetchInputParams): Promise<FetchInputResult> => {
  const collateralAsset = assets.find((asset) => asset.value === collateral);
  const loanAsset = assets.find((asset) => asset.value === loan);

  if (!collateralAsset || !loanAsset) {
    throw new Error(ErrorTypes.FETCH_INPUT_ASSET_ERROR);
  }

  return {
    baseVault: "0x0000000000000000000000000000000000000000",
    baseVaultConversionSample: 1,
    baseFeed1: "0x...",
    baseFeed2: "0x...",
    baseTokenDecimals: collateralAsset.decimals,
    quoteVault: "0x0000000000000000000000000000000000000000",
    quoteVaultConversionSample: 1,
    quoteFeed1: "0x...",
    quoteFeed2: "0x...",
    quoteTokenDecimals: loanAsset.decimals,
    salt: "0x0000000000000000000000000000000000000000",
  };
};

const useFetchInput = () => {
  const [collateral, setCollateral] = useState<string>("");
  const [loan, setLoan] = useState<string>("");
  const [networkId, setNetworkId] = useState<number>(1);
  const [inputData, setInputData] = useState<FetchInputResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInputData = async (
    assets: {
      value: string;
      label: string;
      decimals: number;
      priceUsd: number;
    }[]
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFeeds({ collateral, loan, networkId, assets });
      setInputData(result);
      setError(null); // Ensure error is reset on success
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error in fetchInputData:", err.message);
        setError(ErrorMessages[ErrorTypes.FETCH_INPUT_ERROR]);
      } else {
        setError(ErrorMessages[ErrorTypes.UNKNOWN_ERROR]);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    collateral,
    setCollateral,
    loan,
    setLoan,
    networkId,
    setNetworkId,
    inputData,
    loading,
    error,
    fetchInputData,
  };
};

export default useFetchInput;
