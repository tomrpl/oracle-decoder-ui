import { ethers } from "ethers";
import { TxBuilder } from "@morpho-labs/gnosis-tx-builder";

// Define the OracleInputs structure
interface OracleInputs {
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

// Oracle Factory Addresses
const ORACLE_FACTORY_ADDRESSES: { [key: number]: string } = {
  1: "0x3A7bB36Ee3f3eE32A60e9f2b33c1e5f2E83ad766", // Factory Mainnet
  8453: "0x2DC205F24BCb6B311E5cdf0745B0741648Aebd3d", // Factory Base
};

// ABI for Oracle Factory
const ORACLE_FACTORY_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "oracle",
        type: "address",
      },
    ],
    name: "CreateMorphoChainlinkOracleV2",
    type: "event",
  },
  {
    inputs: [
      { internalType: "contract IERC4626", name: "baseVault", type: "address" },
      {
        internalType: "uint256",
        name: "baseVaultConversionSample",
        type: "uint256",
      },
      {
        internalType: "contract AggregatorV3Interface",
        name: "baseFeed1",
        type: "address",
      },
      {
        internalType: "contract AggregatorV3Interface",
        name: "baseFeed2",
        type: "address",
      },
      { internalType: "uint256", name: "baseTokenDecimals", type: "uint256" },
      {
        internalType: "contract IERC4626",
        name: "quoteVault",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "quoteVaultConversionSample",
        type: "uint256",
      },
      {
        internalType: "contract AggregatorV3Interface",
        name: "quoteFeed1",
        type: "address",
      },
      {
        internalType: "contract AggregatorV3Interface",
        name: "quoteFeed2",
        type: "address",
      },
      { internalType: "uint256", name: "quoteTokenDecimals", type: "uint256" },
      { internalType: "bytes32", name: "salt", type: "bytes32" },
    ],
    name: "createMorphoChainlinkOracleV2",
    outputs: [
      {
        internalType: "contract MorphoChainlinkOracleV2",
        name: "oracle",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "isMorphoChainlinkOracleV2",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
];

/**
 * @notice Main function to generate the transaction payload.
 * @param oracleInputs The oracle inputs for the transaction.
 * @param chainId The ID of the blockchain network.
 * @param safeAddress The address of the safe to execute the transactions.
 */
export const getPayload = async (
  oracleInputs: OracleInputs,
  chainId: number,
  safeAddress: string
) => {
  const oracleFactoryAddress = ORACLE_FACTORY_ADDRESSES[chainId];
  if (!oracleFactoryAddress)
    throw new Error(
      `Oracle Factory Address not found for chain ID ${chainId}.`
    );

  const iface = new ethers.Interface(ORACLE_FACTORY_ABI);

  // Ensure the salt is a valid bytes32
  const saltBytes32 = ethers.zeroPadValue(oracleInputs.salt, 32);

  const transaction = {
    to: oracleFactoryAddress,
    value: "0", // No ETH is sent with the transaction
    data: iface.encodeFunctionData("createMorphoChainlinkOracleV2", [
      oracleInputs.baseVault,
      oracleInputs.baseVaultConversionSample,
      oracleInputs.baseFeed1,
      oracleInputs.baseFeed2,
      oracleInputs.baseTokenDecimals,
      oracleInputs.quoteVault,
      oracleInputs.quoteVaultConversionSample,
      oracleInputs.quoteFeed1,
      oracleInputs.quoteFeed2,
      oracleInputs.quoteTokenDecimals,
      saltBytes32,
    ]),
  };

  const batchJson = TxBuilder.batch(safeAddress, [transaction]);

  return batchJson;
};
