import { useState, useEffect } from "react";
import { ErrorTypes, LoadingStates } from "../services/errorTypes";

const useDecimalCheck = (
  triggerCheck: boolean,
  baseTokenDecimals: number,
  quoteTokenDecimals: number,
  collateralAsset: string,
  loanAsset: string,
  assets: any[]
) => {
  const [loading, setLoading] = useState<LoadingStates>(
    LoadingStates.NOT_STARTED
  );
  const [errors, setErrors] = useState<ErrorTypes[]>([]);
  const [result, setResult] = useState<any>(null);

  const resetState = () => {
    setLoading(LoadingStates.NOT_STARTED);
    setErrors([]);
    setResult(null);
  };

  useEffect(() => {
    if (!triggerCheck) return;
    setLoading(LoadingStates.LOADING);
    setErrors([]);

    try {
      const collateralAssetDecimal =
        assets.find((asset) => asset.value === collateralAsset)?.decimals || "";

      const loanAssetDecimal =
        assets.find((asset) => asset.value === loanAsset)?.decimals || "";

      const baseTokenMarketDecimals = Number(collateralAssetDecimal);
      const quoteTokenMarketDecimals = Number(loanAssetDecimal);
      const baseTokenDecimalsNumber = Number(baseTokenDecimals);
      const quoteTokenDecimalsNumber = Number(quoteTokenDecimals);

      const isVerified =
        baseTokenMarketDecimals === baseTokenDecimalsNumber &&
        quoteTokenMarketDecimals === quoteTokenDecimalsNumber;

      setResult({
        isVerified,
        baseTokenDecimalsProvided: baseTokenDecimalsNumber,
        baseTokenDecimalsExpected: baseTokenMarketDecimals,
        quoteTokenDecimalsProvided: quoteTokenDecimalsNumber,
        quoteTokenDecimalsExpected: quoteTokenMarketDecimals,
      });
      setLoading(LoadingStates.COMPLETED);
    } catch (error) {
      console.error("Error checking decimals:", error);
      setErrors((prevErrors) => [
        ...prevErrors,
        ErrorTypes.FETCH_DECIMALS_ERROR,
      ]);
      setResult({ isValid: false });
    } finally {
      setLoading(LoadingStates.COMPLETED);
    }
  }, [
    triggerCheck,
    baseTokenDecimals,
    quoteTokenDecimals,
    collateralAsset,
    loanAsset,
    assets,
  ]);

  return { loading, errors, result, resetState };
};

export default useDecimalCheck;
