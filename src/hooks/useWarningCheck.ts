import { useState, useEffect } from "react";
import { ErrorTypes, LoadingStates } from "../services/errorTypes";

interface Warning {
  level: string;
  type: string;
}

const useWarningCheck = (
  triggerCheck: boolean,
  markets: any[],
  collateralAsset: string,
  loanAsset: string
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

    if (!markets || markets.length === 0) {
      setResult({
        isVerified: false,
        warnings: [
          {
            level: "info",
            type: "No markets created with this oracle address and provided assets",
          },
        ],
      });
      setLoading(LoadingStates.COMPLETED);
      return;
    }

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

      setResult({
        isVerified: warningsArray.length === 0,
        warnings: warningsArray,
      });
      setLoading(LoadingStates.COMPLETED);
    } catch (error) {
      console.error("Error checking warnings:", error);
      setErrors((prevErrors) => [
        ...prevErrors,
        ErrorTypes.FETCH_WARNING_ERROR,
      ]);
      setResult({ isValid: false });
    } finally {
      setLoading(LoadingStates.COMPLETED);
    }
  }, [triggerCheck, markets, collateralAsset, loanAsset]);

  return { loading, errors, result, resetState };
};

export default useWarningCheck;
