import { useState } from "react";
import { ErrorTypes, LoadingStates } from "../../services/errorTypes";
import { OracleInputs } from "../types";
import { getOraclesWhitelist } from "../../services/official_feeds/oracle_minified";
import {
  MetaMorpho,
  getMetaMorphoVaultInfo,
  isMetaMorphoVault,
} from "../../services/fetchers/metaMorphoFetcher";

interface OracleGraphNode {
  chainId?: number;
  symbol?: string;
  address?: string;
}

type OracleFeedGraphEdge = [OracleGraphNode, OracleGraphNode];

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const useRouteMatch = () => {
  const [loading, setLoadingState] = useState<LoadingStates>(
    LoadingStates.NOT_STARTED
  );
  const [errors, setErrors] = useState<ErrorTypes[]>([]);
  const [result, setResult] = useState<any>(null);

  const resetState = () => {
    setLoadingState(LoadingStates.NOT_STARTED);
    setErrors([]);
    setResult(null);
  };

  const getOracleData = (oracleInputs: OracleInputs) => {
    return {
      baseVault: oracleInputs.baseVault,
      quoteVault: oracleInputs.quoteVault,
      baseFeedOneAddress: oracleInputs.baseFeed1,
      baseFeedTwoAddress: oracleInputs.baseFeed2,
      quoteFeedOneAddress: oracleInputs.quoteFeed1,
      quoteFeedTwoAddress: oracleInputs.quoteFeed2,
    };
  };

  const feedPairToOracleGraphEdge = (
    feedPair?: [string, string] | null | undefined,
    side: "base" | "quote" = "base"
  ): OracleFeedGraphEdge | null => {
    if (!feedPair) return null;
    if (side === "base") {
      return [{ symbol: feedPair[0] }, { symbol: feedPair[1] }];
    } else {
      return [{ symbol: feedPair[1] }, { symbol: feedPair[0] }];
    }
  };

  const vaultToOracleGraphEdge = (
    vault: string | null | undefined,
    vaultInfo: { pair: [string, string] } | null
  ): OracleFeedGraphEdge | null => {
    if (!vault || !vaultInfo) return null;
    return [{ symbol: vaultInfo.pair[0] }, { symbol: vaultInfo.pair[1] }];
  };

  const getMetaMorphoVaultExchangeRateFeeds = (metaMorpho: MetaMorpho) => {
    return {
      chainId: metaMorpho.chainId,
      contractAddress: metaMorpho.address,
      vendor: "Morpho",
      description: `${metaMorpho.symbol} / ${metaMorpho.asset.symbol} MetaMorpho vault exchange rate`,
      pair: [metaMorpho.symbol, metaMorpho.asset.symbol] as [string, string],
    };
  };

  const getAllPossibleOracleFeedGraphs = (
    oracleInputs: OracleInputs,
    unifiedFeeds: any[]
  ) => {
    const oracleData = getOracleData(oracleInputs);

    const baseVault =
      oracleData.baseVault !== ZERO_ADDRESS ? oracleData.baseVault : null;
    const quoteVault =
      oracleData.quoteVault !== ZERO_ADDRESS ? oracleData.quoteVault : null;

    const baseVaultInfo = unifiedFeeds.find(
      (f) =>
        f.contractAddress.toLowerCase() === oracleData.baseVault.toLowerCase()
    );
    const quoteVaultInfo = unifiedFeeds.find(
      (f) =>
        f.contractAddress.toLowerCase() === oracleData.quoteVault.toLowerCase()
    );

    const baseFeedOnePair = unifiedFeeds.find(
      (f) =>
        f.contractAddress.toLowerCase() ===
        oracleData.baseFeedOneAddress.toLowerCase()
    )?.pair;
    const baseFeedTwoPair = unifiedFeeds.find(
      (f) =>
        f.contractAddress.toLowerCase() ===
        oracleData.baseFeedTwoAddress.toLowerCase()
    )?.pair;
    const quoteFeedOnePair = unifiedFeeds.find(
      (f) =>
        f.contractAddress.toLowerCase() ===
        oracleData.quoteFeedOneAddress.toLowerCase()
    )?.pair;
    const quoteFeedTwoPair = unifiedFeeds.find(
      (f) =>
        f.contractAddress.toLowerCase() ===
        oracleData.quoteFeedTwoAddress.toLowerCase()
    )?.pair;

    const baseVaultEdge = vaultToOracleGraphEdge(baseVault, baseVaultInfo);
    const baseFeedOnePairGraphEdge = feedPairToOracleGraphEdge(
      baseFeedOnePair,
      "base"
    );
    const baseFeedTwoPairGraphEdge = feedPairToOracleGraphEdge(
      baseFeedTwoPair,
      "base"
    );
    const quoteFeedOnePairGraphEdge = feedPairToOracleGraphEdge(
      quoteFeedOnePair,
      "quote"
    );
    const quoteFeedTwoPairGraphEdge = feedPairToOracleGraphEdge(
      quoteFeedTwoPair,
      "quote"
    );
    const quoteVaultEdge = vaultToOracleGraphEdge(quoteVault, quoteVaultInfo);

    const graph1 = [
      baseVaultEdge,
      baseFeedOnePairGraphEdge,
      baseFeedTwoPairGraphEdge,
      quoteFeedOnePairGraphEdge,
      quoteFeedTwoPairGraphEdge,
      quoteVaultEdge,
    ].filter((edge) => edge !== null) as OracleFeedGraphEdge[];

    const graph2 = [
      baseVaultEdge,
      baseFeedTwoPairGraphEdge,
      baseFeedOnePairGraphEdge,
      quoteFeedOnePairGraphEdge,
      quoteFeedTwoPairGraphEdge,
      quoteVaultEdge,
    ].filter((edge) => edge !== null) as OracleFeedGraphEdge[];

    const graph3 = [
      baseVaultEdge,
      baseFeedOnePairGraphEdge,
      baseFeedTwoPairGraphEdge,
      quoteFeedTwoPairGraphEdge,
      quoteFeedOnePairGraphEdge,
      quoteVaultEdge,
    ].filter((edge) => edge !== null) as OracleFeedGraphEdge[];

    const graph4 = [
      baseVaultEdge,
      baseFeedTwoPairGraphEdge,
      baseFeedOnePairGraphEdge,
      quoteFeedTwoPairGraphEdge,
      quoteFeedOnePairGraphEdge,
      quoteVaultEdge,
    ].filter((edge) => edge !== null) as OracleFeedGraphEdge[];

    return [graph1, graph2, graph3, graph4];
  };

  const nodesAreMatched = (
    node1: OracleGraphNode,
    node2: OracleGraphNode,
    allowHardcoded?: boolean
  ) => {
    if (
      node1.address &&
      node2.address &&
      node1.address.toLowerCase() === node2.address.toLowerCase()
    ) {
      return true;
    }

    if (node1.symbol && node2.symbol) {
      const symbol1 = node1.symbol.toLowerCase();
      const symbol2 = node2.symbol.toLowerCase();

      if (symbol1 === symbol2) {
        return true;
      }

      // Handle WETH/ETH equivalence
      if (
        (symbol1 === "weth" && symbol2 === "eth") ||
        (symbol1 === "eth" && symbol2 === "weth")
      ) {
        return true;
      }
    }

    return false;
  };

  const edgesAreConnected = (
    edge1: OracleFeedGraphEdge,
    edge2: OracleFeedGraphEdge,
    allowHardcoded?: boolean
  ) => {
    return nodesAreMatched(edge1[1], edge2[0], allowHardcoded);
  };

  const allEdgesAreConnected = (
    edges: OracleFeedGraphEdge[],
    allowHardcoded?: boolean
  ) => {
    if (edges.length === 0) {
      throw new Error("Empty oracle feed graph.");
    }

    if (edges.length === 1) {
      return true;
    }

    return edges.every((edge, i) => {
      if (i === edges.length - 1) return true;
      return edgesAreConnected(edge, edges[i + 1], allowHardcoded);
    });
  };

  const getOracleFeedGraphTerminalNodes = (edges: OracleFeedGraphEdge[]) => {
    if (edges.length === 0) {
      return null;
    }

    const firstEdge = edges[0];
    const lastEdge = edges[edges.length - 1];

    return { base: firstEdge[0], quote: lastEdge[1] };
  };

  const getResolvableOracleFeedGraphs = (
    oracleInputs: OracleInputs,
    unifiedFeeds: any[],
    allowHardcoded?: boolean
  ) => {
    const oracleFeedGraphs = getAllPossibleOracleFeedGraphs(
      oracleInputs,
      unifiedFeeds
    );
    return oracleFeedGraphs.filter((edges) =>
      allEdgesAreConnected(edges, allowHardcoded)
    );
  };

  const baseExchangeRateMatchesToken = (
    resolvableOracleFeedGraphs: OracleFeedGraphEdge[][],
    token: { address: string } | { symbol: string },
    allowHardcoded?: boolean
  ) => {
    return resolvableOracleFeedGraphs.some((edges) => {
      const terminalNodes = getOracleFeedGraphTerminalNodes(edges);
      if (!terminalNodes) {
        return false;
      }

      // Check if the token matches either the first or second symbol of the base vault feed
      if (edges[0] && edges[0][1] && "symbol" in token) {
        return (
          nodesAreMatched(token, terminalNodes.base, allowHardcoded) ||
          nodesAreMatched(token, { symbol: edges[0][1].symbol }, allowHardcoded)
        );
      }

      return nodesAreMatched(token, terminalNodes.base, allowHardcoded);
    });
  };

  const quoteExchangeRateMatchesToken = (
    resolvableOracleFeedGraphs: OracleFeedGraphEdge[][],
    token: { address: string } | { symbol: string },
    allowHardcoded?: boolean
  ) => {
    return resolvableOracleFeedGraphs.some((edges) => {
      const terminalNodes = getOracleFeedGraphTerminalNodes(edges);
      if (!terminalNodes) {
        return false;
      }

      // Check if the token matches either the first or second symbol of the quote vault feed
      if (
        edges[edges.length - 1] &&
        edges[edges.length - 1][0] &&
        "symbol" in token
      ) {
        return (
          nodesAreMatched(token, terminalNodes.quote, allowHardcoded) ||
          nodesAreMatched(
            token,
            { symbol: edges[edges.length - 1][0].symbol },
            allowHardcoded
          )
        );
      }

      return nodesAreMatched(token, terminalNodes.quote, allowHardcoded);
    });
  };

  const tryingRouteMatch = async (
    oracleInputs: OracleInputs,
    chainId: number,
    collateralAssetSymbol: string,
    loanAssetSymbol: string
  ) => {
    setLoadingState(LoadingStates.LOADING);
    setErrors([]);

    const unifiedFeeds = getOraclesWhitelist();

    let relevantFeeds = unifiedFeeds.filter((feed) => feed.chainId === chainId);

    try {
      // Check for MetaMorpho vaults and add them to relevantFeeds
      const potentialVaults = [
        oracleInputs.baseVault,
        oracleInputs.quoteVault,
      ].filter((address) => address !== ZERO_ADDRESS);

      for (const address of potentialVaults) {
        const isMetaMorpho = await isMetaMorphoVault(address, chainId);
        if (isMetaMorpho) {
          const metaMorphoInfo = await getMetaMorphoVaultInfo(address, chainId);
          if (metaMorphoInfo) {
            const metaMorphoFeed =
              getMetaMorphoVaultExchangeRateFeeds(metaMorphoInfo);
            relevantFeeds.push(metaMorphoFeed);
          }
        }
      }

      const resolvableOracleFeedGraphs = getResolvableOracleFeedGraphs(
        oracleInputs,
        relevantFeeds
      );

      if (
        !resolvableOracleFeedGraphs ||
        resolvableOracleFeedGraphs.length === 0
      ) {
        setErrors((prevErrors) => [...prevErrors, ErrorTypes.NO_VALID_PATH]);
        setResult({ isValid: false });
        return;
      }

      const baseMatches = baseExchangeRateMatchesToken(
        resolvableOracleFeedGraphs,
        { symbol: collateralAssetSymbol }
      );

      const quoteMatches = quoteExchangeRateMatchesToken(
        resolvableOracleFeedGraphs,
        { symbol: loanAssetSymbol }
      );

      const isValid = baseMatches && quoteMatches;

      if (!baseMatches) {
        setErrors((prevErrors) => [
          ...prevErrors,
          ErrorTypes.INVALID_COLLATERAL_FEED,
        ]);
      }

      if (!quoteMatches) {
        setErrors((prevErrors) => [
          ...prevErrors,
          ErrorTypes.INVALID_LOAN_FEED,
        ]);
      }

      const feedsMetadata = [
        oracleInputs.baseVault,
        oracleInputs.baseFeed1,
        oracleInputs.baseFeed2,
        oracleInputs.quoteFeed1,
        oracleInputs.quoteFeed2,
        oracleInputs.quoteVault,
      ]
        .filter((feed) => feed !== ZERO_ADDRESS)
        .map((feed, index) => {
          let feedInfo = relevantFeeds.find(
            (f) => f.contractAddress.toLowerCase() === feed.toLowerCase()
          );

          const position =
            index === 0
              ? "Base Vault"
              : index === 1
              ? "Base 1"
              : index === 2
              ? "Base 2"
              : index === 3
              ? "Quote 1"
              : index === 4
              ? "Quote 2"
              : "Quote Vault";

          if (feedInfo) {
            return {
              address: feed,
              vendor: feedInfo.vendor,
              description: feedInfo.description,
              pair: feedInfo.pair,
              chainId: feedInfo.chainId,
              position,
            };
          } else {
            return {
              address: feed,
              vendor: "Unknown",
              description: "Unknown",
              pair: ["Unknown", "Unknown"],
              chainId: "Unknown",
              position,
            };
          }
        });

      setResult({ isValid, feedsMetadata });
    } catch (error) {
      console.error("Error validating route:", error);
      setErrors((prevErrors) => [...prevErrors, ErrorTypes.FETCH_ERROR]);
      setResult({ isValid: false });
    } finally {
      setLoadingState(LoadingStates.COMPLETED);
    }
  };

  return {
    loading,
    errors,
    result,
    tryingRouteMatch,
    resetState,
  };
};

export default useRouteMatch;
