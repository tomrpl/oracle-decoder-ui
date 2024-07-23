import { useState, useEffect } from "react";

const useDecimalCheck = (
  baseTokenDecimals: number,
  quoteTokenDecimals: number,
  collateralAsset: string,
  loanAsset: string,
  assets: any[],
  performCheck: boolean
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!performCheck) return;

    setLoading(true);
    setError(null);

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
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred at decimal check level");
      }
    } finally {
      setLoading(false);
    }
  }, [
    baseTokenDecimals,
    quoteTokenDecimals,
    collateralAsset,
    loanAsset,
    assets,
    performCheck,
  ]);

  return { loading, error, result };
};

export default useDecimalCheck;
