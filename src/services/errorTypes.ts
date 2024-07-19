export enum ErrorTypes {
  MISSING_TRANSACTION_HASH = "MISSING_TRANSACTION_HASH",
  NO_MARKETS_FOUND = "NO_MARKETS_FOUND",
  NO_MATCHING_MARKET = "NO_MATCHING_MARKET",
  FETCH_ERROR = "FETCH_ERROR",
  DECODING_ERROR = "DECODING_ERROR",
  FETCH_INPUT_ASSET_ERROR = "FETCH_INPUT_ASSET_ERROR",
  FETCH_INPUT_ERROR = "FETCH_INPUT_ERROR",
  FETCH_ROUTE_ERROR = "FETCH_ROUTE_ERROR",
  AGGREGATION_ERROR = "AGGREGATION_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  INVALID_FEEDS = "INVALID_FEEDS",
  ZERO_ADDRESS_ERROR = "ZERO_ADDRESS_ERROR",
  INVALID_COLLATERAL_FEED = "INVALID_COLLATERAL_FEED", // New
  INVALID_LOAN_FEED = "INVALID_LOAN_FEED", // New
  INTERMEDIATE_ASSET_MISMATCH = "INTERMEDIATE_ASSET_MISMATCH", // New
  NO_FEEDS_PROVIDED = "NO_FEEDS_PROVIDED", // New
  INVALID_BASE_FEEDS = "INVALID_BASE_FEEDS", // New
  INVALID_QUOTE_FEEDS = "INVALID_QUOTE_FEEDS", // New
}

export const ErrorMessages: { [key in ErrorTypes]: string } = {
  [ErrorTypes.MISSING_TRANSACTION_HASH]:
    "Failed to get transaction hash for the oracle.",
  [ErrorTypes.NO_MARKETS_FOUND]:
    "No markets found in API for the given oracle.",
  [ErrorTypes.NO_MATCHING_MARKET]:
    "No matching market found for the provided assets.",
  [ErrorTypes.FETCH_ERROR]: "Error fetching data.",
  [ErrorTypes.DECODING_ERROR]: "Failed to decode Oracle Data.",
  [ErrorTypes.FETCH_INPUT_ASSET_ERROR]: "Error fetching input asset data.",
  [ErrorTypes.FETCH_INPUT_ERROR]: "Error fetching input data.",
  [ErrorTypes.FETCH_ROUTE_ERROR]: "Error fetching route data.",
  [ErrorTypes.AGGREGATION_ERROR]: "Error aggregating results.",
  [ErrorTypes.UNKNOWN_ERROR]: "An unknown error occurred.",
  [ErrorTypes.INVALID_FEEDS]: "Feeds are not whitelisted",
  [ErrorTypes.ZERO_ADDRESS_ERROR]: "Wrong Oracle inputs",
  [ErrorTypes.INVALID_COLLATERAL_FEED]:
    "The first base feed does not match the collateral asset.",
  [ErrorTypes.INVALID_LOAN_FEED]:
    "The last quote feed does not match the loan asset.",
  [ErrorTypes.INTERMEDIATE_ASSET_MISMATCH]:
    "The intermediate asset does not match between base and quote feeds.",
  [ErrorTypes.NO_FEEDS_PROVIDED]: "No feeds provided",
  [ErrorTypes.INVALID_BASE_FEEDS]:
    "The first base feed does not match the collateral asset.",
  [ErrorTypes.INVALID_QUOTE_FEEDS]:
    "The last quote feed does not match the loan asset.",
};

export enum LoadingStates {
  NOT_STARTED = "NOT_STARTED",
  LOADING = "LOADING",
  COMPLETED = "COMPLETED",
}
