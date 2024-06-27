import { ethers } from "ethers";

export interface OracleData {
  baseVault: string;
  baseVaultConversionSample: string;
  baseFeed1: string;
  baseFeed2: string;
  baseTokenDecimals: string;
  quoteVault: string;
  quoteVaultConversionSample: string;
  quoteFeed1: string;
  quoteFeed2: string;
  quoteTokenDecimals: string;
  salt: string;
}

export const getOracleData = (input: string): OracleData | null => {
  try {
    const callData = input.toLowerCase();
    const methodID = "0xb32cddf4"; // Method ID for createMorphoChainlinkOracleV2

    if (!callData.startsWith(methodID)) {
      throw new Error("Invalid method ID");
    }
    const abiCoder = new ethers.AbiCoder();

    const decodedParams = abiCoder.decode(
      [
        "address", // baseVault
        "uint256", // baseVaultConversionSample
        "address", // baseFeed1
        "address", // baseFeed2
        "uint256", // baseTokenDecimals
        "address", // quoteVault
        "uint256", // quoteVaultConversionSample
        "address", // quoteFeed1
        "address", // quoteFeed2
        "uint256", // quoteTokenDecimals
        "bytes32", // salt
      ],
      "0x" + callData.slice(10) // remove methodID
    );

    return {
      baseVault: decodedParams[0],
      baseVaultConversionSample: decodedParams[1].toString(),
      baseFeed1: decodedParams[2],
      baseFeed2: decodedParams[3],
      baseTokenDecimals: decodedParams[4].toString(),
      quoteVault: decodedParams[5],
      quoteVaultConversionSample: decodedParams[6].toString(),
      quoteFeed1: decodedParams[7],
      quoteFeed2: decodedParams[8],
      quoteTokenDecimals: decodedParams[9].toString(),
      salt: decodedParams[10],
    };
  } catch (error) {
    return null;
  }
};

const extractOracleDataSegments = (inputData: string): string[] => {
  const methodID = "164b32cddf4";
  const segments: string[] = [];
  const pattern = new RegExp(methodID, "g");
  let match;

  while ((match = pattern.exec(inputData)) !== null) {
    const start = match.index;
    const end = start + methodID.length + 32 * 11 * 2; // methodID length + 32 bytes per parameter * 2 hex characters per byte
    const segment = inputData.slice(start, end);
    segments.push(segment);
  }

  return segments;
};

const decodeOracleData = (segment: string): OracleData | null => {
  try {
    const abiCoder = new ethers.AbiCoder();
    const decodedParams = abiCoder.decode(
      [
        "address", // baseVault
        "uint256", // baseVaultConversionSample
        "address", // baseFeed1
        "address", // baseFeed2
        "uint256", // baseTokenDecimals
        "address", // quoteVault
        "uint256", // quoteVaultConversionSample
        "address", // quoteFeed1
        "address", // quoteFeed2
        "uint256", // quoteTokenDecimals
        "bytes32", // salt
      ],
      "0x" + segment.slice(11) // remove methodID length
    );

    return {
      baseVault: decodedParams[0],
      baseVaultConversionSample: decodedParams[1].toString(),
      baseFeed1: decodedParams[2],
      baseFeed2: decodedParams[3],
      baseTokenDecimals: decodedParams[4].toString(),
      quoteVault: decodedParams[5],
      quoteVaultConversionSample: decodedParams[6].toString(),
      quoteFeed1: decodedParams[7],
      quoteFeed2: decodedParams[8],
      quoteTokenDecimals: decodedParams[9].toString(),
      salt: decodedParams[10],
    };
  } catch (error) {
    return null;
  }
};

export const getSafeOracleData = (input: string): (OracleData | null)[] => {
  const segments = extractOracleDataSegments(input);
  return segments.map((segment) => decodeOracleData(segment));
};
