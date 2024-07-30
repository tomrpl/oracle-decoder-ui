import { useState } from "react";
import { OracleInputs } from "../types";
import { ErrorTypes } from "../../services/errorTypes";
import { checkOracleDeployment } from "../../services/fetchers/oracleFetcher";

const useOracleDeploymentCheck = () => {
  const [result, setResult] = useState<{
    isDeployed: boolean;
    address: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorTypes[]>([]);

  const checkDeployment = async (
    chainId: number,
    oracleInputs: OracleInputs
  ) => {
    try {
      setLoading(true);
      setErrors([]);
      const deploymentStatus = await checkOracleDeployment(
        chainId,
        oracleInputs
      );

      if (deploymentStatus.isDeployed) {
        setResult({
          isDeployed: true,
          address: deploymentStatus.address || null,
        });
      } else {
        setResult({
          isDeployed: false,
          address: null,
        });
      }
    } catch (err) {
      console.error("Error checking oracle deployment:", err);
      setErrors((prevErrors) => [
        ...prevErrors,
        ErrorTypes.ORACLE_API_FETCH_ERROR,
      ]);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, errors, checkDeployment };
};

export default useOracleDeploymentCheck;
