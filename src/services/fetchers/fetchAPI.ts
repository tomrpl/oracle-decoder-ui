const API_URL = "https://blue-api.morpho.org/graphql";

// Define the types for the expected data structure
interface Asset {
  symbol: string;
  decimals: number;
  priceUsd: number | null;
}

interface Market {
  uniqueKey: string;
  loanAsset: Asset;
  collateralAsset: Asset;
  warnings: Warning[];
}

interface Warning {
  level: string;
  type: string;
}

interface OracleData {
  address: string;
  type: string;
  data: {
    baseFeedOne: {
      address: string;
      description: string;
      vendor: string;
      pair: string[];
    };
    vault?: string; // Optional field for MorphoChainlinkOracleData
  };
  markets: Market[];
}

export interface Feed {
  address: string;
  description: string;
  vendor: string;
}

interface OracleData2 {
  baseVault: string;
  baseVaultConversionSample: number;
  baseFeedOne: Feed | null;
  baseFeedTwo: Feed | null;
  quoteVault: string;
  quoteFeedOne: Feed | null;
  quoteFeedTwo: Feed | null;
  quoteVaultConversionSample: number;
}

interface Oracle {
  address: string;
  data: OracleData2 | null;
}

interface OracleInfo {
  type: string;
}

export interface Market2 {
  uniqueKey: string;
  warnings: Warning[];
  oracle: Oracle;
  oracleInfo: OracleInfo;
}

export const queryOracleApi = async (
  oracleAddress: string,
  chainId: number
): Promise<OracleData | null> => {
  const query = `query {
    oracleByAddress(
        address: "${oracleAddress}"
        chainId: ${chainId}
    ) {
        markets {
        uniqueKey
        loanAsset {
            symbol
            decimals
            priceUsd
        }
        collateralAsset {
            symbol
            decimals
            priceUsd
        }
        warnings {
            level
            type
        }
        }
        address
        type
        data {
        ... on MorphoChainlinkOracleData {
            baseFeedOne {
            address
            description
            vendor
            pair
            }
            vault
        }
        ... on MorphoChainlinkOracleV2Data {
            baseFeedOne {
            address
            description
            vendor
            pair
            }
        }
        }
    }
    }`;
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const result: any = await response.json();
    return result.data.oracleByAddress as OracleData;
  } catch (error) {
    throw error;
  }
};

export const queryAssetsPrices = async (
  chainId: number,
  collateralAssetSymbol: string,
  loanAssetSymbol: string
): Promise<{ [key: string]: Asset }> => {
  const queries = `
        collateralAssets: assets(where: { symbol_in: ["${collateralAssetSymbol}"], chainId_in: [${chainId}] }) { 
          items {
            symbol
            address
            priceUsd
            chain {
              id
              network
              currency
            }
          }
        },
        loanAssets: assets(where: { symbol_in: ["${loanAssetSymbol}"], chainId_in: [${chainId}] }) { 
          items {
            symbol
            address
            priceUsd
            chain {
              id
              network
              currency
            }
          }
        }
      `;

  const query = `query GetAssetsWithPrice {
      ${queries}
    }`;
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const result: any = await response.json();
    const assets: { [key: string]: Asset } = {};

    const collateralKey = `collateralAssets`;
    const loanKey = `loanAssets`;

    const validCollateralItems = result.data[collateralKey].items.filter(
      (item: Asset) => item.priceUsd !== null
    );
    if (validCollateralItems.length > 0) {
      assets[collateralAssetSymbol] = validCollateralItems[0];
    }

    const validLoanItems = result.data[loanKey].items.filter(
      (item: Asset) => item.priceUsd !== null
    );
    if (validLoanItems.length > 0) {
      assets[loanAssetSymbol] = validLoanItems[0];
    }

    return assets;
  } catch (error) {
    throw error;
  }
};

export const queryAsset = async (chainId: number) => {
  const query = `query {
  assets(where:{chainId_in:[${chainId}]}){
    items {
      address
      symbol 
      decimals
      priceUsd
      vault {
        address
        name
        asset {
          symbol
          address
          decimals
        }
      }
    }
  }
}`;
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const result: any = await response.json();
    return result.data.assets.items as any;
  } catch (error) {
    throw error;
  }
};

export const queryOracles = async (chainId: number) => {
  let allOracles: any[] = [];
  let hasNextPage = true;
  let skip = 0;
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  while (hasNextPage) {
    const query = `query {
      oracles(first: 100, skip: ${skip}, where: { chainId_in: [${chainId}] }) {
        items {
          address
          data {
            ... on MorphoChainlinkOracleV2Data {
              baseVault
              baseFeedOne {
                address
              }
              baseFeedTwo {
                address
              }
              quoteVault
              quoteFeedOne {
                address
              }
              quoteFeedTwo {
                address
              }
              baseVaultConversionSample
              quoteVaultConversionSample
            }
          }
          chain {
            network
          }
        }
      }
    }`;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const result: any = await response.json();
      const oraclesData = result.data.oracles;

      // Replace null values with zero address and filter out items with null data
      const sanitizedItems = oraclesData.items
        .filter((item: any) => item.data !== null)
        .map((item: any) => {
          const data = item.data;
          if (data.baseFeedOne === null)
            data.baseFeedOne = { address: zeroAddress };
          if (data.baseFeedTwo === null)
            data.baseFeedTwo = { address: zeroAddress };
          if (data.quoteFeedOne === null)
            data.quoteFeedOne = { address: zeroAddress };
          if (data.quoteFeedTwo === null)
            data.quoteFeedTwo = { address: zeroAddress };
          return item;
        });

      allOracles = [...allOracles, ...sanitizedItems];

      // Check if we received exactly 100 items
      if (oraclesData.items.length < 100) {
        hasNextPage = false;
      } else {
        skip += 100;
      }
    } catch (error) {
      console.error("Error fetching oracles:", error);
      throw error;
    }
  }

  return allOracles;
};

export const queryOraclesDeployed = async (
  loanAssetAddress: string,
  collateralAssetAddress: string,
  chainId: number
): Promise<Market2[]> => {
  const query = `
    query {
      markets(
        where: {
          loanAssetAddress_in: ["${loanAssetAddress}"]
          collateralAssetAddress_in: ["${collateralAssetAddress}"]
          chainId_in: [${chainId}]
        }
      ) {
        items {
          uniqueKey
          warnings {
            type
            level
          }
          oracle {
            address
            data {
              ... on MorphoChainlinkOracleV2Data {
                baseVault
                baseVaultConversionSample
                baseFeedOne {
                  address
                  description
                  vendor
                }
                baseFeedTwo {
                  address
                  description
                  vendor
                }
                quoteVault
                quoteFeedOne {
                  address
                  description
                  vendor
                }
                quoteFeedTwo {
                  address
                  description
                  vendor
                }
                quoteVaultConversionSample
              }
            }
          }
          oracleInfo {
            type
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: { data: { markets: { items: Market2[] } } } =
      await response.json();
    console.log("response from api", result);
    // Handle potential null values and transform the data
    return result.data.markets.items.map((market) => ({
      ...market,
      oracle: {
        ...market.oracle,
        data: market.oracle.data
          ? {
              ...market.oracle.data,
              baseFeedOne: market.oracle.data.baseFeedOne || null,
              baseFeedTwo: market.oracle.data.baseFeedTwo || null,
              quoteFeedOne: market.oracle.data.quoteFeedOne || null,
              quoteFeedTwo: market.oracle.data.quoteFeedTwo || null,
            }
          : null,
      },
    }));
  } catch (error) {
    console.error("Error fetching oracles deployed:", error);
    throw error;
  }
};
