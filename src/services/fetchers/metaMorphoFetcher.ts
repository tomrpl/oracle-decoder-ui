import { ethers } from "ethers";
import { getProvider } from "../provider/provider";
import { MulticallWrapper } from "ethers-multicall-provider";
import metaMorphoABI from "../abis/MetaMorpho.json";
import metaMorphoFactoryABI from "../abis/MetaMorphoFactory.json";

export interface MetaMorpho {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  asset: {
    address: string;
    symbol: string;
  };
}

export async function isMetaMorphoVault(
  address: string,
  chainId: number
): Promise<boolean> {
  const provider = MulticallWrapper.wrap(getProvider(chainId));

  // the factory contract is the same on Mainnet and Base

  const contract = new ethers.Contract(
    "0xA9c3D3a366466Fa809d1Ae982Fb2c46E5fC41101",
    metaMorphoFactoryABI.abi,
    provider
  );

  try {
    // Try to call a function that should exist on MetaMorpho vaults
    await contract.isMetaMorpho(address);
    return true;
  } catch (error) {
    return false;
  }
}

export async function getMetaMorphoVaultInfo(
  address: string,
  chainId: number
): Promise<MetaMorpho | null> {
  const provider = MulticallWrapper.wrap(getProvider(chainId));
  const contract = new ethers.Contract(address, metaMorphoABI.abi, provider);

  try {
    const [assetAddress, symbol, name] = await Promise.all([
      contract.asset(),
      contract.symbol(),
      contract.name(),
    ]);

    // For the asset symbol, we'd need to make another call to the asset contract
    const assetContract = new ethers.Contract(
      assetAddress,
      ["function symbol() view returns (string)"],
      provider
    );
    const assetSymbol = await assetContract.symbol();

    return {
      chainId,
      address,
      symbol,
      name,
      asset: {
        address: assetAddress,
        symbol: assetSymbol,
      },
    };
  } catch (error) {
    console.error("Error fetching MetaMorpho vault info:", error);
    return null;
  }
}
