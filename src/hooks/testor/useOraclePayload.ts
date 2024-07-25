import { useState } from "react";
import { OracleInputs } from "../types";
import { getPayload } from "../../services/payload";
import { LoadingStates } from "../../services/errorTypes";

const useOraclePayload = () => {
  const [loading, setLoading] = useState<LoadingStates>(
    LoadingStates.NOT_STARTED
  );
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const generatePayload = async (
    oracleInputs: OracleInputs,
    chainId: number,
    safeAddress: string
  ) => {
    setLoading(LoadingStates.LOADING);
    setError(null);

    try {
      const generatedPayload = await getPayload(
        oracleInputs,
        chainId,
        safeAddress
      );
      setResult(generatedPayload);
      setLoading(LoadingStates.COMPLETED);
    } catch (err) {
      setError("Failed to generate payload");
      setLoading(LoadingStates.COMPLETED);
    } finally {
      setLoading(LoadingStates.COMPLETED);
    }
  };

  return { generatePayload, loading, error, result };
};

export default useOraclePayload;
