import React, { useState, useEffect } from "react";
import Select from "react-select";
import ToggleButtonGroup from "./common/ToggleButtonGroup";
import CheckItem from "./common/CheckItem";
import CheckItemPrice from "./common/CheckItemPrice";
import "./common.css";
import useOracleInputs from "../hooks/testor/useOracleInputs";
import useOracleDecimalsCheck from "../hooks/testor/useOracleDecimalsCheck";
import useRouteMatch from "../hooks/testor/useRouteMatch";
import useOraclePayload from "../hooks/testor/useOraclePayload";
import { queryAsset } from "../services/fetchers/fetchAPI";
import { LoadingStates } from "../services/errorTypes";
import { LuExternalLink } from "react-icons/lu";
import useOraclePriceCheck from "../hooks/testor/useOraclePriceCheck";
import CheckItemFeeds from "./common/CheckItemFeeds";
import { Asset } from "../hooks/types";
import useOracleDeploymentCheck from "../hooks/testor/useOracleDeploymentCheck";
import CheckItemDeployment from "./common/CheckItemDeployment";
import { initializeUser, recordQuery } from "../services/rate/userClick";

const ethLogo = "https://cdn.morpho.org/assets/chains/eth.svg";
const baseLogo = "https://cdn.morpho.org/assets/chains/base.png";

const OracleTestor = () => {
  const [activeButton, setActiveButton] = useState<string>("testor");

  const [collateralAsset, setCollateralAsset] = useState("");
  const [loanAsset, setLoanAsset] = useState("");
  const [collateralAssetTouched, setCollateralAssetTouched] = useState(false);
  const [loanAssetTouched, setLoanAssetTouched] = useState(false);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [submitStarted, setSubmitStarted] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showPayload, setShowPayload] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<{
    value: number;
    label: JSX.Element;
  }>({
    value: 1,
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={ethLogo}
          alt="Ethereum"
          style={{ width: 20, height: 20, marginRight: 10 }}
        />
        Ethereum
      </div>
    ),
  });

  const {
    oracleInputs,
    handleOracleInputChange,
    updateBaseTokenDecimals,
    updateQuoteTokenDecimals,
    assets,
    setAssets,
  } = useOracleInputs(selectedNetwork.value);

  const {
    loading: decimalLoading,
    // eslint-disable-next-line
    errors: decimalError,
    result: decimalResult,
    fetchDecimalsCheck,
  } = useOracleDecimalsCheck(
    selectedNetwork.value,
    assets,
    oracleInputs,
    collateralAsset,
    loanAsset
  );

  const {
    loading: routeLoading,
    errors: routeError,
    result: routeResult,
    tryingRouteMatch,
    resetState,
  } = useRouteMatch();

  const {
    generatePayload,
    // eslint-disable-next-line
    loading: payloadLoading,
    error: payloadError,
    result: payloadResult,
  } = useOraclePayload();

  const {
    loading: priceLoading,
    errors: priceError,
    result: priceResult,
    priceCheck,
  } = useOraclePriceCheck(
    selectedNetwork.value,
    oracleInputs,
    collateralAsset,
    loanAsset,
    assets
  );

  const {
    result: deploymentResult,
    loading: deploymentLoading,
    //eslint-disable-next-line
    errors: deploymentError,
    checkDeployment,
  } = useOracleDeploymentCheck();

  useEffect(() => {
    setIsSubmitEnabled(
      collateralAssetTouched &&
        loanAssetTouched &&
        selectedNetwork !== null &&
        collateralAsset.trim() !== "" &&
        loanAsset.trim() !== ""
    );
  }, [
    selectedNetwork,
    collateralAssetTouched,
    loanAssetTouched,
    collateralAsset,
    loanAsset,
  ]);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const assets = await queryAsset(selectedNetwork.value);
        const formattedAssets = assets.map((asset: any) => {
          const formattedAsset: Asset = {
            value: asset.address,
            label: asset.symbol,
            decimals: asset.decimals,
            priceUsd: asset.priceUsd ?? 0, // Provide a default value of 0 when priceUsd is null
          };

          if (asset.vault) {
            formattedAsset.vault = {
              address: asset.vault.address,
              name: asset.vault.name,
              asset: {
                symbol: asset.vault.asset.symbol,
                address: asset.vault.asset.address,
                decimals: asset.vault.asset.decimals,
              },
            };
          }

          return formattedAsset;
        });
        setAssets(formattedAssets);
      } catch (error) {
        console.error("Error fetching assets:", error);
      }
    };

    fetchAssets();
    // eslint-disable-next-line
  }, [selectedNetwork]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    resetState();
    try {
      const locationAddress = window.location.hostname;
      if (!userId) {
        const newUserId = await initializeUser(locationAddress);
        setUserId(newUserId);
      }
      await recordQuery(userId || "", locationAddress);
    } catch (error) {
      console.log("Error updating click count");
    }
    setIsSubmitting(true);
    setSubmitStarted(true);
    setFormSubmitted(true);

    setCountdown(5);
    const countdownInterval = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(countdownInterval);
        }
        return prevCountdown - 1;
      });
    }, 1000);

    await fetchDecimalsCheck();

    const collateralAssetSymbol =
      assets.find((asset) => asset.value === collateralAsset)?.label || "";

    const loanAssetSymbol =
      assets.find((asset) => asset.value === loanAsset)?.label || "";

    await tryingRouteMatch(
      oracleInputs,
      selectedNetwork.value,
      collateralAssetSymbol,
      loanAssetSymbol
    );
    await priceCheck();
    await checkDeployment(selectedNetwork.value, oracleInputs);
    setIsSubmitting(false);
  };

  const handleGeneratePayload = async () => {
    await generatePayload(
      oracleInputs,
      selectedNetwork.value,
      "0x0000000000000000000000000000000000000000"
    );
    setShowPayload(true);
  };

  const handleDownload = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(payloadResult, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "payload.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const openSafeLink = () => {
    const url =
      "https://app.safe.global/apps/open?safe=eth%3A0xD81E0983e8e133d34670728406d08637374e545D&appUrl=https%3A%2F%2Fapps-portal.safe.global%2Ftx-builder";
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) newWindow.opener = null;
  };

  const networkOptions = [
    {
      value: 1,
      label: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={ethLogo}
            alt="Ethereum"
            style={{ width: 20, height: 20, marginRight: 10 }}
          />
          Ethereum
        </div>
      ),
    },
    {
      value: 8453,
      label: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={baseLogo}
            alt="Base"
            style={{ width: 20, height: 20, marginRight: 10 }}
          />
          Base
        </div>
      ),
    },
  ];

  const getExplorerUrl = (address: string) => {
    const baseUrl =
      selectedNetwork.value === 1
        ? "https://etherscan.io/address/"
        : "https://basescan.org/address/";
    return `${baseUrl}${address}`;
  };

  return (
    <div className="main-background">
      <div className="oracle-container">
        <div className="header">
          <div className="form-section">
            <ToggleButtonGroup
              activeButton={activeButton}
              setActiveButton={setActiveButton}
            />
            <div className="instructions">
              <p>
                The goal of the <strong>Oracle Testor</strong> is for an oracle
                deployer to test the inputs to set at oracle deployment.
              </p>
              <p>
                {" "}
                The <strong>salt</strong> value can be ignored for now.
              </p>
            </div>

            <h2>Inputs</h2>
            <form onSubmit={handleSubmit}>
              <div className="inputs-row">
                <div className="inputs-section">
                  <label className="label">
                    Network:
                    <span style={{ color: "var(--ifm-color-red)" }}> *</span>
                  </label>
                  <Select
                    options={networkOptions}
                    value={selectedNetwork}
                    onChange={(selectedOption) => {
                      setSelectedNetwork(selectedOption || networkOptions[0]);
                    }}
                    styles={{
                      control: (base) => ({
                        ...base,
                        fontSize: "0.8rem",
                        width: "80%",
                      }),
                    }}
                    placeholder="Select a network"
                  />
                </div>
                <div className="inputs-section">
                  <label className="label">
                    Collateral Asset:
                    <span style={{ color: "var(--ifm-color-red)" }}> *</span>
                  </label>
                  <Select
                    options={assets}
                    onChange={(selectedOption) => {
                      setCollateralAsset(selectedOption?.value || "");
                      setCollateralAssetTouched(true);
                      updateBaseTokenDecimals(selectedOption?.value || "");
                    }}
                    styles={{
                      control: (base) => ({
                        ...base,
                        fontSize: "0.7rem",
                        width: "80%",
                      }),
                    }}
                    placeholder="Select an asset"
                  />
                </div>
                <div className="inputs-section">
                  <label className="label">
                    Loan Asset:
                    <span style={{ color: "var(--ifm-color-red)" }}> *</span>
                  </label>
                  <Select
                    options={assets}
                    onChange={(selectedOption) => {
                      setLoanAsset(selectedOption?.value || "");
                      setLoanAssetTouched(true);
                      updateQuoteTokenDecimals(selectedOption?.value || "");
                    }}
                    styles={{
                      control: (base) => ({
                        ...base,
                        fontSize: "0.7rem",
                        width: "80%",
                      }),
                    }}
                    placeholder="Select an asset"
                  />
                </div>
              </div>
              <p> </p>
              <div className="inputs-section horizontal-input">
                <label className="oracle-label">
                  Base Vault
                  <div className="oracle-input-details">
                    If collat is ERC4626
                  </div>
                </label>
                <input
                  type="text"
                  value={oracleInputs.baseVault}
                  onChange={(e) =>
                    handleOracleInputChange("baseVault", e.target.value)
                  }
                  className="oracle-input-not-supported"
                />
              </div>

              <div className="inputs-section horizontal-input">
                <label className="oracle-label">
                  Base Vault Conv. Sample
                  <div className="oracle-input-details">
                    Default 1 if Base Vault is zero address
                  </div>
                  <div className="oracle-input-details">
                    Nb of asset to convert base vault units
                  </div>
                </label>
                <input
                  type="number"
                  value={oracleInputs.baseVaultConversionSample}
                  onChange={(e) =>
                    handleOracleInputChange(
                      "baseVaultConversionSample",
                      e.target.value
                    )
                  }
                  className="oracle-input-not-supported"
                />
              </div>

              <div className="inputs-section horizontal-input">
                <label className="oracle-label">
                  Base Feed 1
                  <div className="oracle-input-details">
                    Chainlink, Redstone, Pyth, Chronicle,..
                  </div>
                </label>
                <input
                  type="text"
                  value={oracleInputs.baseFeed1}
                  onChange={(e) =>
                    handleOracleInputChange("baseFeed1", e.target.value)
                  }
                  className="oracle-input"
                />
              </div>
              <div className="inputs-section horizontal-input">
                <label className="oracle-label">Base Feed 2</label>
                <input
                  type="text"
                  value={oracleInputs.baseFeed2}
                  onChange={(e) =>
                    handleOracleInputChange("baseFeed2", e.target.value)
                  }
                  className="oracle-input"
                />
              </div>

              <div className="inputs-section horizontal-input">
                <label className="oracle-label">
                  Base Token Decimals{" "}
                  <div className="oracle-input-details">
                    MUST equal collat asset decimals
                  </div>
                  <div className="oracle-input-details">
                    If ERC4626: should be the underlying asset
                  </div>
                </label>
                <input
                  type="number"
                  value={oracleInputs.baseTokenDecimals}
                  onChange={(e) =>
                    handleOracleInputChange("baseTokenDecimals", e.target.value)
                  }
                  className="oracle-input"
                />
              </div>
              <div className="inputs-section horizontal-input">
                <label className="oracle-label">
                  Quote Vault{" "}
                  <div className="oracle-input-details">If loan is ERC4626</div>
                </label>
                <input
                  type="text"
                  value={oracleInputs.quoteVault}
                  onChange={(e) =>
                    handleOracleInputChange("quoteVault", e.target.value)
                  }
                  className="oracle-input-not-supported"
                />
              </div>

              <div className="inputs-section horizontal-input">
                <label className="oracle-label">
                  Quote Vault Conv. Sample
                  <div className="oracle-input-details">
                    Idem as base Vault Conv. Sample
                  </div>
                </label>
                <input
                  type="number"
                  value={oracleInputs.quoteVaultConversionSample}
                  onChange={(e) =>
                    handleOracleInputChange(
                      "quoteVaultConversionSample",
                      e.target.value
                    )
                  }
                  className="oracle-input-not-supported"
                />
              </div>
              <div className="inputs-section horizontal-input">
                <label className="oracle-label">Quote Feed 1</label>
                <input
                  type="text"
                  value={oracleInputs.quoteFeed1}
                  onChange={(e) =>
                    handleOracleInputChange("quoteFeed1", e.target.value)
                  }
                  className="oracle-input"
                />
              </div>

              <div className="inputs-section horizontal-input">
                <label className="oracle-label">Quote Feed 2</label>
                <input
                  type="text"
                  value={oracleInputs.quoteFeed2}
                  onChange={(e) =>
                    handleOracleInputChange("quoteFeed2", e.target.value)
                  }
                  className="oracle-input"
                />
              </div>
              <div className="inputs-section horizontal-input">
                <label className="oracle-label">
                  Quote Token Decimals{" "}
                  <div className="oracle-input-details">
                    MUST equal loan asset decimals
                  </div>
                  <div className="oracle-input-details">
                    If ERC4626: should be the underlying asset
                  </div>
                </label>
                <input
                  type="number"
                  value={oracleInputs.quoteTokenDecimals}
                  onChange={(e) =>
                    handleOracleInputChange(
                      "quoteTokenDecimals",
                      e.target.value
                    )
                  }
                  className="oracle-input"
                />
              </div>

              <div className="inputs-section horizontal-input">
                <label className="oracle-label">Salt</label>
                <input
                  type="text"
                  value={oracleInputs.salt}
                  onChange={(e) =>
                    handleOracleInputChange("salt", e.target.value)
                  }
                  className="oracle-input"
                />
              </div>

              <div className="button-section" style={{ textAlign: "right" }}>
                <button
                  type="submit"
                  disabled={!isSubmitEnabled || isSubmitting}
                  className="submit-button"
                  onClick={handleSubmit}
                  style={{ opacity: isSubmitting ? 0.6 : 1 }}
                >
                  {isSubmitting ? `Checking... (${countdown})` : "Check"}
                </button>
                <button
                  type="submit"
                  disabled={!isSubmitEnabled || isSubmitting}
                  className="submit-button"
                  onClick={handleGeneratePayload}
                  style={{
                    marginLeft: "10px",
                    opacity: 1,
                  }}
                >
                  {"Generate Payload"}
                </button>
              </div>
              {payloadError && (
                <div style={{ color: "red" }}>{payloadError}</div>
              )}
            </form>
          </div>

          <div className="checks-section">
            <h2>Checks - Post Submit</h2>

            {submitStarted && decimalLoading === true}

            <CheckItem
              title="Decimals Check"
              isVerified={
                formSubmitted ? decimalResult?.isVerified ?? null : null
              }
              details={
                decimalResult?.isVerified
                  ? `Base Token Decimals: ${decimalResult.baseTokenDecimalsProvided}, 
Quote Token Decimals: ${decimalResult.quoteTokenDecimalsProvided}`
                  : decimalResult
                  ? `Base Token Decimals: 
Provided: ${decimalResult.baseTokenDecimalsProvided}, Expected: ${decimalResult.baseTokenDecimalsExpected} 
Quote Token Decimals: 
Provided: ${decimalResult.quoteTokenDecimalsProvided}, Expected: ${decimalResult.quoteTokenDecimalsExpected}`
                  : ""
              }
              description={`Verify that the BaseTokenDecimal and QuoteTokenDecimal match the expected values based on the selected collateral and loan tokens.`}
              loading={formSubmitted ? decimalLoading : false}
            />

            <CheckItemDeployment
              title="Deployment Check"
              isVerified={
                deploymentResult ? !deploymentResult.isDeployed : null
              }
              details={
                deploymentResult ? (
                  deploymentResult.isDeployed ? (
                    <>
                      An oracle with these inputs is already deployed at
                      address:{" "}
                      <a
                        href={getExplorerUrl(deploymentResult.address || "")}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontWeight: "bold" }}
                      >
                        {deploymentResult.address}
                      </a>
                    </>
                  ) : (
                    "No oracle with these inputs has been deployed yet, feel free to proceed."
                  )
                ) : (
                  ""
                )
              }
              description="Check if an oracle with the same inputs has already been deployed."
              loading={deploymentLoading}
            />

            <CheckItemFeeds
              title="Feeds Check"
              isVerified={formSubmitted ? routeResult?.isValid ?? null : null}
              isHardcoded={
                formSubmitted ? routeResult?.isHardcoded ?? null : null
              }
              details={
                formSubmitted && routeResult
                  ? routeResult.isValid
                    ? "The Route seems Valid"
                    : "The Route seems not Valid"
                  : ""
              }
              description={`Verify that combination of feeds is valid and that the oracle can be deployed with the provided inputs.`}
              loading={
                formSubmitted ? routeLoading === LoadingStates.LOADING : false
              }
              feedsMetadata={formSubmitted ? routeResult?.feedsMetadata : []}
              errors={routeError}
            />

            <CheckItemPrice
              title="Price Check"
              isVerified={
                formSubmitted ? priceResult?.isVerified ?? null : null
              }
              details={
                priceResult
                  ? {
                      scaleFactor: priceResult.scaleFactor,
                      oraclePrice: priceResult.price,
                      oraclePriceUnscaled: priceResult.priceUnscaled,
                      priceUnscaledInCollateralTokenDecimals:
                        priceResult.priceUnscaledInCollateralTokenDecimals,
                      collateralPriceUsd: priceResult.collateralPriceUsd,
                      loanPriceUsd: priceResult.loanPriceUsd,
                      ratioUsdPrice: priceResult.ratioUsdPrice,
                      oraclePriceEquivalent: priceResult.oraclePriceEquivalent,
                      percentageDifference: priceResult.percentageDifference,
                    }
                  : undefined
              }
              description="Compute the deviation price between the 2 assets priced in the api and the reconstructed oracle price thanks to the underlying feeds."
              loading={formSubmitted ? priceLoading : false}
              errors={priceError}
            />

            {showPayload && (
              <>
                <div className="payload-section">
                  <h2>
                    Generated Payload for Safe Tx
                    <button
                      onClick={openSafeLink}
                      className="external-link-button"
                    >
                      <span className="button-text">Open Safe</span>
                      <LuExternalLink size={20} />
                      <img
                        src="https://app.safe.global/favicon.ico"
                        alt="Safe Icon"
                        className="safe-icon"
                        height="20px"
                      />
                    </button>
                  </h2>
                  <div className="payload-content">
                    {Object.entries(payloadResult).map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {JSON.stringify(value, null, 2)}
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  className="download-button-section"
                  style={{ textAlign: "right" }}
                >
                  <button onClick={handleDownload} className="submit-button">
                    Download Payload
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OracleTestor;
