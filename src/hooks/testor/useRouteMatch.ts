import { useState } from "react";
import { ErrorTypes, LoadingStates } from "../../services/errorTypes";
import { OracleInputs } from "./useOracleInputs";
import { getOraclesWhitelist } from "../../services/official_feeds/oracle_minified";

interface AssetNode {
  asset: string;
}

interface Edge {
  from: AssetNode;
  to: AssetNode;
  feed: any;
  context: "Base" | "Quote";
}

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

  const tryingRouteMatch = async (
    oracleInputs: OracleInputs,
    chainId: number,
    collateralAssetSymbol: string,
    loanAssetSymbol: string
  ) => {
    setLoadingState(LoadingStates.LOADING);
    setErrors([]);

    const addresses = [
      oracleInputs.baseFeed1,
      oracleInputs.baseFeed2,
      oracleInputs.quoteFeed1,
      oracleInputs.quoteFeed2,
      oracleInputs.baseVault,
      oracleInputs.quoteVault,
    ];
    const nonZeroAddressExists = addresses.some(
      (addr) => addr !== ZERO_ADDRESS
    );

    if (!nonZeroAddressExists) {
      setErrors((prevErrors) => [...prevErrors, ErrorTypes.ZERO_ADDRESS_ERROR]);
      setLoadingState(LoadingStates.COMPLETED);
      setResult({ isValid: false });
      return;
    }

    const unifiedFeeds = getOraclesWhitelist();

    function feedExists(feed: string): boolean {
      return unifiedFeeds.some(
        (f) => f.contractAddress.toLowerCase() === feed.toLowerCase()
      );
    }

    const feeds = [
      oracleInputs.baseFeed1,
      oracleInputs.baseFeed2,
      oracleInputs.quoteFeed1,
      oracleInputs.quoteFeed2,
    ].filter((feed) => feed !== ZERO_ADDRESS);

    const allFeedsExist = feeds.every(feedExists);

    if (!allFeedsExist) {
      setErrors((prevErrors) => [...prevErrors, ErrorTypes.INVALID_FEEDS]);
      setLoadingState(LoadingStates.COMPLETED);
      setResult({ isValid: false });
      return;
    }

    function getRelevantFeeds(feeds: any[], chainId: number) {
      return feeds.filter((feed) => feed.chainId === chainId);
    }

    const relevantFeeds = getRelevantFeeds(unifiedFeeds, chainId);

    function buildGraph(feeds: any[]): {
      nodes: Map<string, AssetNode>;
      edges: Edge[];
    } {
      const nodes = new Map<string, AssetNode>();
      const edges: Edge[] = [];

      feeds.forEach((feed) => {
        if (!feed.pair) {
          return;
        }
        const [base, quote] = feed.pair.map((p: string) => p.toLowerCase());
        const baseNode: AssetNode = nodes.get(base) || { asset: base };
        const quoteNode: AssetNode = nodes.get(quote) || { asset: quote };

        nodes.set(base, baseNode);
        nodes.set(quote, quoteNode);

        edges.push({ from: baseNode, to: quoteNode, feed, context: "Base" });
        edges.push({ from: quoteNode, to: baseNode, feed, context: "Quote" });
      });

      return { nodes, edges };
    }
    // eslint-disable-next-line
    const { nodes, edges } = buildGraph(relevantFeeds);

    function findIntermediateAsset(feed: string): string | null {
      const edge = edges.find(
        (e) => e.feed.contractAddress.toLowerCase() === feed.toLowerCase()
      );

      if (edge) {
        return edge.to.asset.toLowerCase();
      }
      return null;
    }

    function validateRoute(oracleInputs: OracleInputs, edges: Edge[]): boolean {
      const baseFeeds = [oracleInputs.baseFeed1, oracleInputs.baseFeed2]
        .filter((feed) => feed !== ZERO_ADDRESS)
        .map((feed) => feed.toLowerCase());
      const quoteFeeds = [oracleInputs.quoteFeed1, oracleInputs.quoteFeed2]
        .filter((feed) => feed !== ZERO_ADDRESS)
        .map((feed) => feed.toLowerCase());

      const feeds = [...baseFeeds, ...quoteFeeds];

      if (feeds.length === 0) {
        setErrors((prevErrors) => [
          ...prevErrors,
          ErrorTypes.NO_FEEDS_PROVIDED,
        ]);
        return false;
      }

      const firstBaseFeedPair = edges.find(
        (e) => e.feed.contractAddress.toLowerCase() === baseFeeds[0]
      )?.feed.pair;

      if (
        !firstBaseFeedPair ||
        firstBaseFeedPair[0].toLowerCase() !==
          collateralAssetSymbol.toLowerCase()
      ) {
        setErrors((prevErrors) => [
          ...prevErrors,
          ErrorTypes.INVALID_COLLATERAL_FEED,
        ]);
        return false;
      }

      let currentAsset = baseFeeds[0]
        ? findIntermediateAsset(baseFeeds[0])
        : null;

      currentAsset = baseFeeds[1]
        ? findIntermediateAsset(baseFeeds[1]) || currentAsset
        : currentAsset;

      if (!currentAsset) {
        setErrors((prevErrors) => [
          ...prevErrors,
          ErrorTypes.INVALID_BASE_FEEDS,
        ]);
        return false;
      }

      const intermediateAsset = currentAsset;

      currentAsset = quoteFeeds[0]
        ? findIntermediateAsset(quoteFeeds[0]) || currentAsset
        : currentAsset;

      currentAsset = quoteFeeds[1]
        ? findIntermediateAsset(quoteFeeds[1]) || currentAsset
        : currentAsset;

      if (!currentAsset) {
        setErrors((prevErrors) => [
          ...prevErrors,
          ErrorTypes.INVALID_QUOTE_FEEDS,
        ]);
        return false;
      }

      const isValid = intermediateAsset === currentAsset;

      if (!isValid) {
        setErrors((prevErrors) => [
          ...prevErrors,
          ErrorTypes.INTERMEDIATE_ASSET_MISMATCH,
        ]);
      }

      return isValid;
    }

    try {
      const routeIsValid = validateRoute(oracleInputs, edges);

      const feedsMetadata = feeds.map((feed, index) => {
        const feedInfo = unifiedFeeds.find(
          (f) => f.contractAddress.toLowerCase() === feed.toLowerCase()
        );
        const position =
          index === 0
            ? "Base 1"
            : index === 1
            ? "Base 2"
            : index === 2
            ? "Quote 1"
            : "Quote 2";

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

      setResult({ isValid: routeIsValid, feedsMetadata });
      setLoadingState(LoadingStates.COMPLETED);
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
