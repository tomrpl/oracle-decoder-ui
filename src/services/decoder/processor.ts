import { getOracleData, getSafeOracleData, OracleData } from "./oracleDecoder";
import { Provider } from "ethers";

export const getOracleDataFromTx = async (
  txCreation: string,
  provider: Provider
): Promise<OracleData[] | null> => {
  try {
    const tx = await provider.getTransaction(txCreation);
    if (tx) {
      let oracleDataList: OracleData[] = [];
      const oracleData = getOracleData(tx.data);
      if (!oracleData) {
        console.log(
          "The transaction has been executed by safe or a foundry script. Trying safe decoding"
        );
        const safeOracleData = getSafeOracleData(tx.data);
        if (safeOracleData.length > 0) {
          oracleDataList = safeOracleData.filter(
            (data) => data !== null
          ) as OracleData[];
        }
      } else {
        oracleDataList.push(oracleData);
      }
      return oracleDataList.length > 0 ? oracleDataList : null;
    }
    return null;
  } catch (error) {
    console.error("Failed to get Oracle Data:", error);
    return null;
  }
};
