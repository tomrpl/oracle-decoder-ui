import { useState, useEffect, useCallback } from "react";

export interface OracleInputs {
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

const defaultOracleInputs: OracleInputs = {
  baseVault: "0x0000000000000000000000000000000000000000",
  baseVaultConversionSample: 1,
  baseFeed1: "0x0000000000000000000000000000000000000000",
  baseFeed2: "0x0000000000000000000000000000000000000000",
  baseTokenDecimals: 18,
  quoteVault: "0x0000000000000000000000000000000000000000",
  quoteVaultConversionSample: 1,
  quoteFeed1: "0x0000000000000000000000000000000000000000",
  quoteFeed2: "0x0000000000000000000000000000000000000000",
  quoteTokenDecimals: 18,
  salt: "0x0000000000000000000000000000000000000000",
};

const useOracleInputs = (selectedNetwork: number) => {
  const [oracleInputs, setOracleInputs] =
    useState<OracleInputs>(defaultOracleInputs);
  const [assets, setAssets] = useState<any[]>([]);

  const handleOracleInputChange = (field: string, value: any) => {
    setOracleInputs((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const updateBaseTokenDecimals = useCallback(
    (collateralAsset: string) => {
      const collateralDecimals =
        assets.find((asset) => asset.value === collateralAsset)?.decimals || 18;
      setOracleInputs((prevState) => ({
        ...prevState,
        baseTokenDecimals: collateralDecimals,
      }));
    },
    [assets]
  );

  const updateQuoteTokenDecimals = useCallback(
    (loanAsset: string) => {
      const loanDecimals =
        assets.find((asset) => asset.value === loanAsset)?.decimals || 18;
      setOracleInputs((prevState) => ({
        ...prevState,
        quoteTokenDecimals: loanDecimals,
      }));
    },
    [assets]
  );

  return {
    oracleInputs,
    handleOracleInputChange,
    updateBaseTokenDecimals,
    updateQuoteTokenDecimals,
    assets,
    setAssets,
  };
};

export default useOracleInputs;
