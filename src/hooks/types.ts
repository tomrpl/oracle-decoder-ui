interface VaultAsset {
  symbol: string;
  address: string;
  decimals: number;
}

interface Vault {
  address: string;
  name: string;
  asset: VaultAsset;
}

export interface Asset {
  value: string;
  label: string;
  decimals: number;
  priceUsd: number;
  vault?: Vault;
}

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
