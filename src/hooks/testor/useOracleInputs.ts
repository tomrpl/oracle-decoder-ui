import { useState, useEffect } from "react";

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
  baseFeed1: "0xfdFD9C85aD200c506Cf9e21F1FD8dd01932FBB23",
  baseFeed2: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
  baseTokenDecimals: 8,
  quoteVault: "0x0000000000000000000000000000000000000000",
  quoteVaultConversionSample: 1,
  quoteFeed1: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
  quoteFeed2: "0x0000000000000000000000000000000000000000",
  quoteTokenDecimals: 6,
  salt: "0x0000000000000000000000000000000000000000",
};

const useOracleInputs = (selectedNetwork: number) => {
  const [oracleInputs, setOracleInputs] =
    useState<OracleInputs>(defaultOracleInputs);
  // eslint-disable-next-line
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {}, [selectedNetwork]);

  const handleOracleInputChange = (field: string, value: any) => {
    setOracleInputs((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  return { oracleInputs, handleOracleInputChange, assets };
};

export default useOracleInputs;
