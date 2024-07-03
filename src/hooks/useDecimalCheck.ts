import { useState, useEffect } from "react";

const useDecimalCheck = (
  baseTokenDecimals: number,
  quoteTokenDecimals: number,
  markets: any[],
  collateralAsset: string,
  loanAsset: string,
  performCheck: boolean
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!performCheck || !markets) return;

    setLoading(true);
    setError(null);

    try {
      const market = markets.find(
        (market: any) =>
          market.collateralAsset.symbol === collateralAsset &&
          market.loanAsset.symbol === loanAsset
      );

      if (!market) {
        throw new Error("No matching market found for the provided assets.");
      }

      const baseTokenMarketDecimals = Number(market.collateralAsset.decimals);
      const quoteTokenMarketDecimals = Number(market.loanAsset.decimals);
      const baseTokenDecimalsNumber = Number(baseTokenDecimals);
      const quoteTokenDecimalsNumber = Number(quoteTokenDecimals);

      console.log("baseTokenDecimals", baseTokenDecimalsNumber);
      console.log("quoteTokenDecimals", quoteTokenDecimalsNumber);
      console.log("baseTokenMarketDecimals", baseTokenMarketDecimals);
      console.log("quoteTokenMarketDecimals", quoteTokenMarketDecimals);

      const isVerified =
        baseTokenMarketDecimals === baseTokenDecimalsNumber &&
        quoteTokenMarketDecimals === quoteTokenDecimalsNumber;
      console.log("isVerified", isVerified);
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
    markets,
    collateralAsset,
    loanAsset,
    performCheck,
  ]);

  return { loading, error, result };
};

export default useDecimalCheck;
