import { useState } from "react";
import { ErrorTypes } from "../../services/errorTypes";

interface OracleInputs {
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

const useOracleDecimalsCheck = (
  selectedNetwork: number,
  assets: { value: string; label: string; decimals: number }[],
  oracleInputs: OracleInputs,
  collateralAsset: string,
  loanAsset: string
) => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorTypes[]>([]);

  const fetchDecimalsCheck = async () => {
    try {
      setLoading(true);
      setErrors([]);

      const collateralAssetData = assets.find(
        (asset) => asset.value === collateralAsset
      );
      const loanAssetData = assets.find((asset) => asset.value === loanAsset);
      const baseTokenDecimalsExpected = collateralAssetData?.decimals;
      const quoteTokenDecimalsExpected = loanAssetData?.decimals;

      setResult({
        isVerified:
          Number(oracleInputs.baseTokenDecimals) ===
            baseTokenDecimalsExpected &&
          Number(oracleInputs.quoteTokenDecimals) ===
            quoteTokenDecimalsExpected,
        baseTokenDecimalsProvided: oracleInputs.baseTokenDecimals,
        baseTokenDecimalsExpected,
        quoteTokenDecimalsProvided: oracleInputs.quoteTokenDecimals,
        quoteTokenDecimalsExpected,
      });
    } catch (error) {
      console.error("Error fetching oracle data:", error);
      setErrors((prevErrors) => [...prevErrors, ErrorTypes.FETCH_ERROR]);
    } finally {
      setLoading(false);
    }
  };

  return { loading, errors, result, fetchDecimalsCheck };
};

export default useOracleDecimalsCheck;
