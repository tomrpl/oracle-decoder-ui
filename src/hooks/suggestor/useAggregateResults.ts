// import { useState, useEffect } from "react";
// import useFetchInput from "./useFetchInput";
// import useFetchRoutes from "./useFetchRoutes";
// import { ErrorTypes, ErrorMessages } from "../../services/errorTypes";

// export interface Asset {
//   value: string;
//   label: string;
//   decimals: number;
//   priceUsd: number | null;
// }

// interface AggregatedResult {
//   baseVault: string;
//   baseVaultConversionSample: number;
//   baseFeed1: string;
//   baseFeed2: string;
//   baseTokenDecimals: number;
//   quoteVault: string;
//   quoteVaultConversionSample: number;
//   quoteFeed1: string;
//   quoteFeed2: string;
//   quoteTokenDecimals: number;
//   salt: string;
//   numberOfRoutes: number;
// }

// const defaultAggregatedResult: AggregatedResult = {
//   baseVault: "0x0000000000000000000000000000000000000000",
//   baseVaultConversionSample: 1,
//   baseFeed1: "0x0000000000000000000000000000000000000000",
//   baseFeed2: "0x0000000000000000000000000000000000000000",
//   baseTokenDecimals: 18,
//   quoteVault: "0x0000000000000000000000000000000000000000",
//   quoteVaultConversionSample: 1,
//   quoteFeed1: "0x0000000000000000000000000000000000000000",
//   quoteFeed2: "0x0000000000000000000000000000000000000000",
//   quoteTokenDecimals: 18,
//   salt: "0x0000000000000000000000000000000000000000",
//   numberOfRoutes: 0,
// };

// const useAggregateResults = () => {
//   const [aggregatedResult, setAggregatedResult] = useState<AggregatedResult>(
//     defaultAggregatedResult
//   );
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const {
//     collateral,
//     setCollateral,
//     loan,
//     setLoan,
//     networkId,
//     setNetworkId,
//     inputData,
//     loading: inputLoading,
//     error: inputError,
//     fetchInputData,
//   } = useFetchInput();

//   const {
//     routeData,
//     loading: routeLoading,
//     error: routeError,
//     fetchRoutes,
//   } = useFetchRoutes();

//   useEffect(() => {
//     if (inputError) {
//       setError(ErrorMessages[ErrorTypes.FETCH_INPUT_ERROR]);
//     }
//   }, [inputError]);

//   useEffect(() => {
//     if (routeError) {
//       setError(ErrorMessages[ErrorTypes.FETCH_ROUTE_ERROR]);
//     }
//   }, [routeError]);

//   const fetchAggregatedResults = async (assets: Asset[]) => {
//     setLoading(true);
//     setError(null);
//     setAggregatedResult(defaultAggregatedResult);

//     try {
//       await fetchInputData(assets);
//       if (inputError) {
//         console.log("Error in fetchInputData:", inputError);
//       }

//       fetchRoutes(collateral, loan, networkId);
//       if (routeError) {
//         console.log("Error in fetchRoutes:", routeError);
//       }

//       const zeroAddress = "0x0000000000000000000000000000000000000000";
//       const firstRoute = routeData?.routes[0] || [];
//       console.log(routeData?.routes);
//       const baseFeed1 = firstRoute[0]?.feed.address || zeroAddress;
//       const baseFeed2 = firstRoute[1]?.feed.address || zeroAddress;
//       const quoteFeed1 = firstRoute[0]?.feed.address || zeroAddress;
//       const quoteFeed2 = firstRoute[1]?.feed.address || zeroAddress;

//       const result: AggregatedResult = {
//         baseVault: inputData?.baseVault || zeroAddress,
//         baseVaultConversionSample: inputData?.baseVaultConversionSample || 1,
//         baseFeed1,
//         baseFeed2,
//         baseTokenDecimals: inputData?.baseTokenDecimals || 18,
//         quoteVault: inputData?.quoteVault || zeroAddress,
//         quoteVaultConversionSample: inputData?.quoteVaultConversionSample || 1,
//         quoteFeed1,
//         quoteFeed2,
//         quoteTokenDecimals: inputData?.quoteTokenDecimals || 6,
//         salt: inputData?.salt || zeroAddress,
//         numberOfRoutes: routeData?.numberOfRoutes || 0,
//       };

//       console.log("Aggregated Result:", result);
//       setAggregatedResult(result);
//     } catch (err) {
//       console.error("Error in fetchAggregatedResults:", err);
//       setError(ErrorMessages[ErrorTypes.UNKNOWN_ERROR]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return {
//     collateral,
//     setCollateral,
//     loan,
//     setLoan,
//     networkId,
//     setNetworkId,
//     aggregatedResult,
//     loading,
//     error,
//     fetchAggregatedResults,
//   };
// };

// export default useAggregateResults;
