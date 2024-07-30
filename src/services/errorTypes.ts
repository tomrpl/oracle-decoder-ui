export enum ErrorTypes {
  MISSING_TRANSACTION_HASH = "MISSING_TRANSACTION_HASH",
  NO_MARKETS_FOUND = "NO_MARKETS_FOUND",
  NO_MATCHING_MARKET = "NO_MATCHING_MARKET",
  FETCH_ERROR = "FETCH_ERROR",
  FETCH_ORACLE_ADDRESS_ERROR = "FETCH_ORACLE_ADDRESS_ERROR",
  DECODING_ERROR = "DECODING_ERROR",
  FETCH_INPUT_ASSET_ERROR = "FETCH_INPUT_ASSET_ERROR",
  FETCH_INPUT_ERROR = "FETCH_INPUT_ERROR",
  FETCH_ROUTE_ERROR = "FETCH_ROUTE_ERROR",
  AGGREGATION_ERROR = "AGGREGATION_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  INVALID_FEEDS = "INVALID_FEEDS",
  ZERO_ADDRESS_ERROR = "ZERO_ADDRESS_ERROR",
  INVALID_COLLATERAL_FEED = "INVALID_COLLATERAL_FEED",
  INVALID_LOAN_FEED = "INVALID_LOAN_FEED",
  INTERMEDIATE_ASSET_MISMATCH = "INTERMEDIATE_ASSET_MISMATCH",
  NO_FEEDS_PROVIDED = "NO_FEEDS_PROVIDED",
  INVALID_BASE_FEEDS = "INVALID_BASE_FEEDS",
  INVALID_QUOTE_FEEDS = "INVALID_QUOTE_FEEDS",
  FETCH_PRICE_ERROR = "FETCH_PRICE_ERROR",
  FETCH_DECIMALS_ERROR = "FETCH_DECIMALS_ERROR",
  FETCH_WARNING_ERROR = "FETCH_WARNING_ERROR",
  NO_VALID_PATH = "NO_VALID_PATH",
  BASE_MATCH_ERROR = "BASE_MATCH_ERROR",
  QUOTE_MATCH_ERROR = "QUOTE_MATCH_ERROR",
  LOAN_ASSET_ZERO_PRICE = "LOAN_ASSET_ZERO_PRICE",
}

export const ErrorMessages: { [key in ErrorTypes]: string } = {
  [ErrorTypes.MISSING_TRANSACTION_HASH]:
    "Failed to get transaction hash for the oracle.",
  [ErrorTypes.NO_MARKETS_FOUND]:
    "No markets found in API for the given oracle.",
  [ErrorTypes.NO_MATCHING_MARKET]:
    "No matching market found for the provided assets.",
  [ErrorTypes.FETCH_ERROR]: "Error fetching data.",
  [ErrorTypes.FETCH_ORACLE_ADDRESS_ERROR]:
    "Error fetching data for the given oracle.",
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
  [ErrorTypes.FETCH_PRICE_ERROR]: "Error fetching price data.",
  [ErrorTypes.FETCH_DECIMALS_ERROR]: "Error fetching decimals data.",
  [ErrorTypes.FETCH_WARNING_ERROR]: "Error fetching warning data.",
  [ErrorTypes.NO_VALID_PATH]: "No valid path found.",
  [ErrorTypes.BASE_MATCH_ERROR]:
    "Base token does not match. Is there any harcoded oracle price?",
  [ErrorTypes.QUOTE_MATCH_ERROR]:
    "Quote token does not match. Is there any harcoded oracle price?",
  [ErrorTypes.LOAN_ASSET_ZERO_PRICE]:
    "Can't fetch the USD value of the loan asset. The Morpho-Blue API seems to not be pricing it.",
};

export enum LoadingStates {
  NOT_STARTED = "NOT_STARTED",
  LOADING = "LOADING",
  COMPLETED = "COMPLETED",
}
