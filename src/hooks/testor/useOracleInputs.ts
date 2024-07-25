import { useState, useCallback } from "react";
import { Asset, OracleInputs } from "../types";

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
  const [assets, setAssets] = useState<Asset[]>([]);

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
