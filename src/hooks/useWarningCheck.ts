import { useState, useEffect } from "react";

interface Warning {
  level: string;
  type: string;
}

const useWarningCheck = (
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
      const criticalWarnings = [
        "unrecognized_oracle",
        "unrecognized_oracle_feed",
        "hardcoded_oracle_feed",
        "hardcoded_oracle",
        "incompatible_oracle_feeds",
        "incorrect_collateral_exchange_rate",
        "incorrect_loan_exchange_rate",
      ];

      const filteredMarkets = markets.filter(
        (market: any) =>
          market.collateralAsset.symbol === collateralAsset &&
          market.loanAsset.symbol === loanAsset
      );

      const uniqueWarnings = new Set<string>();

      console.log("Filtered Markets: ", filteredMarkets);

      const warningsArray: Warning[] = [];

      filteredMarkets.forEach((market: any) => {
        if (market.warnings && Array.isArray(market.warnings)) {
          market.warnings.forEach((warning: Warning) => {
            if (criticalWarnings.includes(warning.type)) {
              uniqueWarnings.add(`${warning.level}:${warning.type}`);
            }
          });
        }
      });

      uniqueWarnings.forEach((warning) => {
        const [level, type] = warning.split(":");
        warningsArray.push({ level, type });
      });

      console.log("Warnings Array: ", warningsArray);

      setResult({
        isVerified: warningsArray.length === 0,
        warnings: warningsArray,
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred at warning check level");
      }
    } finally {
      setLoading(false);
    }
  }, [markets, collateralAsset, loanAsset, performCheck]);

  return { loading, error, result };
};

export default useWarningCheck;
