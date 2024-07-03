// errorTypes.ts
export enum ErrorTypes {
  MISSING_TRANSACTION_HASH = "MISSING_TRANSACTION_HASH",
  NO_MARKETS_FOUND = "NO_MARKETS_FOUND",
  NO_MATCHING_MARKET = "NO_MATCHING_MARKET",
  FETCH_ERROR = "FETCH_ERROR",
  DECODING_ERROR = "DECODING_ERROR",
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
};

// loadingStates.ts
export enum LoadingStates {
  NOT_STARTED = "NOT_STARTED",
  LOADING = "LOADING",
  COMPLETED = "COMPLETED",
}
