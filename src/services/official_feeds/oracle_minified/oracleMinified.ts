import redstoneFeedsMainnet from "./redstone-feeds-mainnet.json";
import redstoneFeedsBase from "./redstone-feeds-base.json";
import chainlinkFeedsBase from "./chainlink-feeds-base.json";
import chainlinkFeedsMainnet from "./chainlink-feeds-mainnet.json";
import morphoLabsOracleFeeds from "./morpho-labs-oracle-feeds-whitelist.json";

export function getOraclesWhitelist() {
  const minifiedRestoneFeedsMainnet = redstoneFeedsMainnet.map((feed: any) => ({
    chainId: 1,
    contractAddress: feed.contractAddress,
    vendor: "Redstone",
    description: `${feed.symbol} / ${feed.denomination} (${feed.deviationThreshold})`,
    pair: [feed.symbol, feed.denomination] as [string, string],
  }));

  const minifiedRestoneFeedsBase = redstoneFeedsBase.map((feed: any) => ({
    chainId: 8453,
    contractAddress: feed.contractAddress,
    vendor: "Redstone",
    description: `${feed.symbol} / ${feed.denomination} (${feed.deviationThreshold})`,
    pair: [feed.symbol, feed.denomination] as [string, string],
  }));

  const minifiedChainlinkMainnetFeeds = chainlinkFeedsMainnet.map(
    (feed: any) => ({
      chainId: 1,
      contractAddress: feed.proxyAddress
        ? feed.proxyAddress
        : feed.contractAddress,
      vendor: "Chainlink",
      description: `${feed.name} (${feed.threshold}%)`,
      pair: (() => {
        if (feed.pair[0] !== "" && feed.pair[1] !== "") {
          return feed.pair as [string, string];
        }
        if (feed.docs.baseAsset && feed.docs.quoteAsset) {
          return [feed.docs.baseAsset, feed.docs.quoteAsset] as [
            string,
            string
          ];
        }
        if (feed.name.includes("/")) {
          return feed.name.split("/") as [string, string];
        }
        return null;
      })(),
    })
  );

  const minifiedChainlinkBaseFeeds = chainlinkFeedsBase.map((feed: any) => ({
    chainId: 8453,
    contractAddress: feed.proxyAddress
      ? feed.proxyAddress
      : feed.contractAddress,
    vendor: "Chainlink",
    description: `${feed.name} (${feed.threshold}%)`,
    pair: (() => {
      if (feed.pair[0] !== "" && feed.pair[1] !== "") {
        return feed.pair as [string, string];
      }
      if (feed.docs.baseAsset && feed.docs.quoteAsset) {
        return [feed.docs.baseAsset, feed.docs.quoteAsset] as [string, string];
      }
      if (feed.name.includes("/")) {
        return feed.name.split("/") as [string, string];
      }
      return null;
    })(),
  }));

  // TODO: Add oval chainlink feeds to the whitelist through
  // some automatic mean instead of hardcoding them in Morpho Labs whitelist.
  const minifiedMorphoLabsFeeds = morphoLabsOracleFeeds.oracleFeeds.map(
    (feed: any) => ({
      chainId: feed.chainId,
      contractAddress: feed.contractAddress,
      vendor: feed.vendor,
      description: feed.description,
      pair: feed.pair as [string, string],
    })
  );

  return [
    ...minifiedRestoneFeedsMainnet,
    ...minifiedRestoneFeedsBase,
    ...minifiedChainlinkMainnetFeeds,
    ...minifiedChainlinkBaseFeeds,
    ...minifiedMorphoLabsFeeds,
  ];
}
