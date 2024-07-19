import redstoneFeedsMainnet from "./redstone-feeds-mainnet.json";
import redstoneFeedsBase from "./redstone-feeds-base.json";
import chainlinkFeedsBase from "./chainlink-feeds-base.json";
import chainlinkFeedsMainnet from "./chainlink-feeds-mainnet.json";
import morphoLabsOracleFeeds from "./morpho-labs-oracle-feeds-whitelist.json";

// Function to normalize symbols, replacing ETH with WETH
const normalizeSymbol = (symbol: string): string => {
  return symbol.toUpperCase() === "ETH" ? "WETH" : symbol;
};

export function getOraclesWhitelist() {
  const minifiedRestoneFeedsMainnet = redstoneFeedsMainnet.map((feed: any) => ({
    chainId: 1,
    contractAddress: feed.contractAddress,
    vendor: "Redstone",
    description: `${normalizeSymbol(feed.symbol)} / ${normalizeSymbol(
      feed.denomination
    )} (${feed.deviationThreshold})`,
    pair: [
      normalizeSymbol(feed.symbol),
      normalizeSymbol(feed.denomination),
    ] as [string, string],
  }));

  const minifiedRestoneFeedsBase = redstoneFeedsBase.map((feed: any) => ({
    chainId: 8453,
    contractAddress: feed.contractAddress,
    vendor: "Redstone",
    description: `${normalizeSymbol(feed.symbol)} / ${normalizeSymbol(
      feed.denomination
    )} (${feed.deviationThreshold})`,
    pair: [
      normalizeSymbol(feed.symbol),
      normalizeSymbol(feed.denomination),
    ] as [string, string],
  }));

  const minifiedChainlinkMainnetFeeds = chainlinkFeedsMainnet.map(
    (feed: any) => ({
      chainId: 1,
      contractAddress: feed.proxyAddress
        ? feed.proxyAddress
        : feed.contractAddress,
      vendor: "Chainlink",
      description: `${normalizeSymbol(feed.name)} (${feed.threshold}%)`,
      pair: (() => {
        if (feed.pair[0] !== "" && feed.pair[1] !== "") {
          return [
            normalizeSymbol(feed.pair[0]),
            normalizeSymbol(feed.pair[1]),
          ] as [string, string];
        }
        if (feed.docs.baseAsset && feed.docs.quoteAsset) {
          return [
            normalizeSymbol(feed.docs.baseAsset),
            normalizeSymbol(feed.docs.quoteAsset),
          ] as [string, string];
        }
        if (feed.name.includes("/")) {
          const pair = feed.name.split("/") as [string, string];
          return [normalizeSymbol(pair[0]), normalizeSymbol(pair[1])] as [
            string,
            string
          ];
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
    description: `${normalizeSymbol(feed.name)} (${feed.threshold}%)`,
    pair: (() => {
      if (feed.pair[0] !== "" && feed.pair[1] !== "") {
        return [
          normalizeSymbol(feed.pair[0]),
          normalizeSymbol(feed.pair[1]),
        ] as [string, string];
      }
      if (feed.docs.baseAsset && feed.docs.quoteAsset) {
        return [
          normalizeSymbol(feed.docs.baseAsset),
          normalizeSymbol(feed.docs.quoteAsset),
        ] as [string, string];
      }
      if (feed.name.includes("/")) {
        const pair = feed.name.split("/") as [string, string];
        return [normalizeSymbol(pair[0]), normalizeSymbol(pair[1])] as [
          string,
          string
        ];
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
      pair: [normalizeSymbol(feed.pair[0]), normalizeSymbol(feed.pair[1])] as [
        string,
        string
      ],
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
