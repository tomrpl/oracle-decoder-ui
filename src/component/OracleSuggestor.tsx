// import React, { useState, useEffect } from "react";
// import Select from "react-select";
// import ToggleButtonGroup from "./common/ToggleButtonGroup";
// import CheckItemSuggestor from "./common/CheckItemSuggestor";
// import "./common.css"; // Reuse the existing CSS for consistency
// import { queryAsset } from "../services/fetchers/fetchAPI";
// import useAggregateResults from "../hooks/suggestor/useAggregateResults";
// import useFetchRoutes from "../hooks/suggestor/useFetchRoutes"; // Assuming this is the correct path
// import { Asset } from "../hooks/suggestor/useAggregateResults"; // Define the Asset type in a common types file if not already defined

// const ethLogo = "https://cdn.morpho.org/assets/chains/eth.svg";
// const baseLogo = "https://cdn.morpho.org/assets/chains/base.png";

// const OracleSuggestor: React.FC = () => {
//   const {
//     collateral,
//     setCollateral,
//     loan,
//     setLoan,
//     networkId,
//     setNetworkId,
//     aggregatedResult,
//     loading: aggLoading,
//     error: aggError,
//     fetchAggregatedResults,
//   } = useAggregateResults();

//   const {
//     routeData,
//     loading: routeLoading,
//     error: routeError,
//     fetchRoutes,
//   } = useFetchRoutes();

//   const [selectedNetwork, setSelectedNetwork] = useState<{
//     value: number;
//     label: JSX.Element;
//   }>({
//     value: 1,
//     label: (
//       <div style={{ display: "flex", alignItems: "center" }}>
//         <img
//           src={ethLogo}
//           alt="Ethereum"
//           style={{ width: 20, height: 20, marginRight: 10 }}
//         />
//         Ethereum
//       </div>
//     ),
//   });
//   const [activeButton, setActiveButton] = useState<string>("suggestor");
//   const [assets, setAssets] = useState<Asset[]>([]);
//   const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [countdown, setCountdown] = useState(5);
//   const [submitStarted, setSubmitStarted] = useState(false);
//   const [collateralAssetTouched, setCollateralAssetTouched] = useState(false);
//   const [loanAssetTouched, setLoanAssetTouched] = useState(false);

//   const networkOptions = [
//     {
//       value: 1,
//       label: (
//         <div style={{ display: "flex", alignItems: "center" }}>
//           <img
//             src={ethLogo}
//             alt="Ethereum"
//             style={{ width: 20, height: 20, marginRight: 10 }}
//           />
//           Ethereum
//         </div>
//       ),
//     },
//     {
//       value: 8453,
//       label: (
//         <div style={{ display: "flex", alignItems: "center" }}>
//           <img
//             src={baseLogo}
//             alt="Base"
//             style={{ width: 20, height: 20, marginRight: 10 }}
//           />
//           Base
//         </div>
//       ),
//     },
//   ];

//   useEffect(() => {
//     setIsSubmitEnabled(
//       collateralAssetTouched &&
//         loanAssetTouched &&
//         collateral.trim() !== "" &&
//         loan.trim() !== "" &&
//         selectedNetwork !== null
//     );
//   }, [
//     collateral,
//     loan,
//     selectedNetwork,
//     collateralAssetTouched,
//     loanAssetTouched,
//   ]);

//   useEffect(() => {
//     const fetchAssets = async () => {
//       try {
//         const assets = await queryAsset(selectedNetwork?.value || 1);
//         const formattedAssets = assets.map((asset: any) => ({
//           value: asset.symbol,
//           label: asset.symbol,
//           decimals: asset.decimals,
//         }));
//         setAssets(formattedAssets);
//       } catch (error) {
//         console.error("Error fetching assets:", error);
//       }
//     };

//     fetchAssets();
//   }, [selectedNetwork]);

//   const handleSuggest = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setIsSubmitting(true);
//     setSubmitStarted(true);

//     setCountdown(5);
//     const countdownInterval = setInterval(() => {
//       setCountdown((prevCountdown) => {
//         if (prevCountdown <= 1) {
//           clearInterval(countdownInterval);
//         }
//         return prevCountdown - 1;
//       });
//     }, 1000);

//     await fetchAggregatedResults(assets);

//     setIsSubmitting(false);
//   };

//   const handleFetchRoutes = () => {
//     fetchRoutes(collateral, loan, networkId);
//   };

//   return (
//     <div className="main-background">
//       <div className="oracle-container">
//         <div className="header">
//           <div className="form-section">
//             <ToggleButtonGroup
//               activeButton={activeButton}
//               setActiveButton={setActiveButton}
//             />
//             <div className="instructions">
//               <p>
//                 The goal of the <strong>Oracle Suggestor</strong> is to suggest
//                 you the inputs to provide to get an oracle that is properly set
//                 up.
//               </p>
//               <p>
//                 The <strong>salt</strong> value can be ignored for now.
//               </p>
//             </div>
//             <h2>Inputs</h2>
//             <form onSubmit={handleSuggest}>
//               <div className="inputs-section">
//                 <label className="label">
//                   Network:
//                   <span style={{ color: "var(--ifm-color-red)" }}> *</span>
//                 </label>
//                 <Select
//                   options={networkOptions}
//                   value={selectedNetwork}
//                   onChange={(selectedOption) => {
//                     setSelectedNetwork(selectedOption || networkOptions[0]);
//                     setNetworkId(selectedOption?.value || 1);
//                   }}
//                   styles={{
//                     control: (base) => ({
//                       ...base,
//                       fontSize: "0.8rem",
//                       width: "400px",
//                     }),
//                   }}
//                   placeholder="Select a network"
//                 />
//               </div>
//               <div className="inputs-section">
//                 <label className="label">
//                   Collateral Asset Supported (on this network):
//                   <span style={{ color: "var(--ifm-color-red)" }}> *</span>
//                 </label>
//                 <Select
//                   options={assets}
//                   onChange={(selectedOption) => {
//                     setCollateral(selectedOption?.value || "");
//                     setCollateralAssetTouched(true);
//                   }}
//                   styles={{
//                     control: (base) => ({
//                       ...base,
//                       fontSize: "0.8rem",
//                       width: "400px",
//                     }),
//                   }}
//                   placeholder="Select an asset"
//                 />
//               </div>
//               <div className="inputs-section">
//                 <label className="label">
//                   Loan Asset Supported (on this network):
//                   <span style={{ color: "var(--ifm-color-red)" }}> *</span>
//                 </label>
//                 <Select
//                   options={assets}
//                   onChange={(selectedOption) => {
//                     setLoan(selectedOption?.value || "");
//                     setLoanAssetTouched(true);
//                   }}
//                   styles={{
//                     control: (base) => ({
//                       ...base,
//                       fontSize: "0.8rem",
//                       width: "400px",
//                     }),
//                   }}
//                   placeholder="Select an asset"
//                 />
//               </div>
//               <div style={{ textAlign: "right" }}>
//                 <button
//                   type="submit"
//                   disabled={!isSubmitEnabled || isSubmitting}
//                   className="submit-button"
//                   style={{ opacity: isSubmitting ? 0.6 : 1 }}
//                 >
//                   {isSubmitting
//                     ? `Submitting... (${countdown})`
//                     : "Suggest Oracle Inputs"}
//                 </button>
//               </div>
//             </form>
//           </div>
//           <div className="checks-section">
//             <h1>Checks - Post Submit</h1>
//             <CheckItemSuggestor
//               title="Route Data"
//               isVerified={routeData !== null}
//               details={`Number of Routes: ${routeData?.numberOfRoutes || 0}`}
//               loading={routeLoading}
//               error={routeError || undefined}
//               description={`Fetching possible routes between the selected collateral and loan assets.`}
//             />
//             <div className="instructions">
//               {aggregatedResult && (
//                 <div className="suggestions">
//                   <h2>Number of Routes: {aggregatedResult.numberOfRoutes}</h2>
//                   <h3>Suggested Inputs:</h3>
//                   <p>Base Vault: {aggregatedResult.baseVault}</p>
//                   <p>
//                     Base Vault Conversion Sample:{" "}
//                     {aggregatedResult.baseVaultConversionSample}
//                   </p>
//                   <p>Base Feed 1: {aggregatedResult.baseFeed1}</p>
//                   <p>Base Feed 2: {aggregatedResult.baseFeed2}</p>
//                   <p>
//                     Base Token Decimals: {aggregatedResult.baseTokenDecimals}
//                   </p>
//                   <p>Quote Vault: {aggregatedResult.quoteVault}</p>
//                   <p>
//                     Quote Vault Conversion Sample:{" "}
//                     {aggregatedResult.quoteVaultConversionSample}
//                   </p>
//                   <p>Quote Feed 1: {aggregatedResult.quoteFeed1}</p>
//                   <p>Quote Feed 2: {aggregatedResult.quoteFeed2}</p>
//                   <p>
//                     Quote Token Decimals: {aggregatedResult.quoteTokenDecimals}
//                   </p>
//                   <p>Salt: {aggregatedResult.salt}</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OracleSuggestor;
