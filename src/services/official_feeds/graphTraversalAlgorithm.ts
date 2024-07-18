import { getOraclesWhitelist } from "./oracle_minified";

interface AssetNode {
  asset: string;
}

interface Edge {
  from: AssetNode;
  to: AssetNode;
  feed: any; // The oracle feed
  context: "Base" | "Quote"; // Tag to indicate if used in Base or Quote area
}

function findRoutes(
  collateralAsset: string,
  loanAsset: string,
  chainId: number,
  maxDepth: number = 4
) {
  // Step 1: Get the unified feeds
  const unifiedFeeds = getOraclesWhitelist();

  // Step 2: Filter relevant feeds for collateral and loan assets
  function getRelevantFeeds(asset: string, feeds: any[], chainId: number) {
    return feeds.filter(
      (feed) =>
        feed.pair && feed.chainId === chainId && feed.pair.includes(asset)
    );
  }

  const collateralFeeds = getRelevantFeeds(
    collateralAsset,
    unifiedFeeds,
    chainId
  );
  const loanFeeds = getRelevantFeeds(loanAsset, unifiedFeeds, chainId);

  // Step 3: Build a graph from the feeds
  function buildGraph(feeds: any[]): {
    nodes: Map<string, AssetNode>;
    edges: Edge[];
  } {
    const nodes = new Map<string, AssetNode>();
    const edges: Edge[] = [];

    feeds.forEach((feed) => {
      const [base, quote] = feed.pair;
      const baseNode: AssetNode = nodes.get(base) || { asset: base };
      const quoteNode: AssetNode = nodes.get(quote) || { asset: quote };

      nodes.set(base, baseNode);
      nodes.set(quote, quoteNode);

      // Tagging edges as Base or Quote
      edges.push({ from: baseNode, to: quoteNode, feed, context: "Base" });
      edges.push({ from: quoteNode, to: baseNode, feed, context: "Quote" }); // Bidirectional edge
    });

    return { nodes, edges };
  }

  const { nodes, edges } = buildGraph([...collateralFeeds, ...loanFeeds]);

  // Step 4: Find routes using a graph traversal algorithm
  function findRoutesBetweenAssets(
    start: AssetNode,
    end: AssetNode,
    edges: Edge[],
    maxDepth: number = 4
  ): Edge[][] {
    const routes: Edge[][] = [];
    const visited = new Set<string>();

    function dfs(current: AssetNode, path: Edge[], depth: number) {
      if (depth > maxDepth) return;
      if (current.asset === end.asset) {
        routes.push([...path]);
        return;
      }

      visited.add(current.asset);

      for (const edge of edges) {
        if (edge.from.asset === current.asset && !visited.has(edge.to.asset)) {
          if (path.filter((e) => e.context === edge.context).length >= 2) {
            continue; // Skip if there are already 2 feeds of the same context in the path
          }
          path.push(edge);
          dfs(edge.to, path, depth + 1);
          path.pop();
        }
      }

      visited.delete(current.asset);
    }

    dfs(start, [], 0);
    return routes;
  }

  const startNode = nodes.get(collateralAsset);
  const endNode = nodes.get(loanAsset);

  if (!startNode || !endNode) {
    throw new Error("Invalid collateral or loan asset");
  }

  const routes = findRoutesBetweenAssets(
    startNode as AssetNode,
    endNode as AssetNode,
    edges,
    maxDepth
  );

  // Step 5: Display routes
  console.log(`Possible routes from ${collateralAsset} to ${loanAsset}:`);
  routes.forEach((route, index) => {
    console.log(`
      Route ${index + 1}:`);
    route.forEach((edge) => {
      console.log(
        `${edge.from.asset} -> ${edge.to.asset} (${edge.feed.vendor}) [${edge.context}]`
      );
    });
  });

  return routes;
}

// Example usage
// findRoutes("weETH", "USDC", 1);
