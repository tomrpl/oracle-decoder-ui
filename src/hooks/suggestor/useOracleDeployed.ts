import { useState, useCallback } from "react";
import { ErrorTypes, LoadingStates } from "../../services/errorTypes";
import {
  Market2,
  queryOraclesDeployed,
} from "../../services/fetchers/fetchAPI";

interface OracleDeployedResult {
  isValid: boolean;
  oracleData?: Market2[];
}

const useOracleDeployed = () => {
  const [loading, setLoadingState] = useState<LoadingStates>(
    LoadingStates.NOT_STARTED
  );
  const [errors, setErrors] = useState<ErrorTypes[]>([]);
  const [result, setResult] = useState<OracleDeployedResult | null>(null);

  const resetState = useCallback(() => {
    setLoadingState(LoadingStates.NOT_STARTED);
    setErrors([]);
    setResult(null);
  }, []);

  const fetchOracleData = useCallback(
    async (
      loanAssetAddress: string,
      collateralAssetAddress: string,
      chainId: number
    ) => {
      setLoadingState(LoadingStates.LOADING);
      setErrors([]);

      try {
        const response = await queryOraclesDeployed(
          loanAssetAddress,
          collateralAssetAddress,
          chainId
        );

        console.log(response);
        if (response.length > 0) {
          setResult({ isValid: true, oracleData: response });
        } else {
          setResult({ isValid: false });
        }
      } catch (error) {
        console.error("Error fetching oracle data:", error);
        setErrors([ErrorTypes.FETCH_ERROR]);
        setResult({ isValid: false });
      } finally {
        setLoadingState(LoadingStates.COMPLETED);
      }
    },
    []
  );

  return {
    loading,
    errors,
    result,
    resetState,
    fetchOracleData,
  };
};

export default useOracleDeployed;
