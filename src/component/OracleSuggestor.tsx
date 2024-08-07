import React, { useState, useEffect } from "react";
import Select from "react-select";
import ToggleButtonGroup from "./common/ToggleButtonGroup";
import "./common.css";
import { queryAsset } from "../services/fetchers/fetchAPI";
import { ErrorTypes, LoadingStates } from "../services/errorTypes";
import { Asset } from "../hooks/types";
import { initializeUser, recordQuery } from "../services/rate/userClick";
import useOracleDeployed from "../hooks/suggestor/useOracleDeployed";
import CheckItemOraclesDeployed from "./common/CheckItemOraclesDeployed";

const ethLogo = "https://cdn.morpho.org/assets/chains/eth.svg";
const baseLogo = "https://cdn.morpho.org/assets/chains/base.png";

const OracleSuggestor = () => {
  const [activeButton, setActiveButton] = useState<string>("testor");

  const [collateralAsset, setCollateralAsset] = useState("");
  const [loanAsset, setLoanAsset] = useState("");
  const [collateralAssetTouched, setCollateralAssetTouched] = useState(false);
  const [loanAssetTouched, setLoanAssetTouched] = useState(false);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  //eslint-disable-next-line
  const [submitStarted, setSubmitStarted] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  //eslint-disable-next-line
  const [loading, setLoadingState] = useState<LoadingStates>(
    LoadingStates.NOT_STARTED
  );
  //eslint-disable-next-line
  const [errors, setErrors] = useState<ErrorTypes[]>([]);
  //eslint-disable-next-line
  const [result, setResult] = useState<any>(null);
  const [showOracleDetails, setShowOracleDetails] = useState(false); // New state for showOracleDetails

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
    loading: deployedLoading,
    //eslint-disable-next-line
    errors: deployedErrors,
    result: deployedResult,
    fetchOracleData,
  } = useOracleDeployed();

  useEffect(() => {
    if (formSubmitted && !isSubmitting) {
      fetchOracleData(loanAsset, collateralAsset, selectedNetwork.value);
    }
  }, [
    formSubmitted,
    isSubmitting,
    loanAsset,
    collateralAsset,
    selectedNetwork,
    fetchOracleData,
  ]);
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
        const formattedAssets = assets
          .filter(
            (asset: any) =>
              asset.address !== "0xcbfb9B444d9735C345Df3A0F66cd89bD741692E9"
          )
          .map((asset: any) => {
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

  const resetState = () => {
    setLoadingState(LoadingStates.NOT_STARTED);
    setErrors([]);
    setResult(null);
  };

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
    setShowOracleDetails(true); // Set showOracleDetails to true when submitting

    setCountdown(5);
    const countdownInterval = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(countdownInterval);
        }
        return prevCountdown - 1;
      });
    }, 1000);

    // const collateralAssetSymbol =
    //   assets.find((asset) => asset.value === collateralAsset)?.label || "";

    // const loanAssetSymbol =
    //   assets.find((asset) => asset.value === loanAsset)?.label || "";

    setIsSubmitting(false);
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

  const handleNetworkChange = (selectedOption: any) => {
    setSelectedNetwork(selectedOption || networkOptions[0]);
    // Reset collateral and loan asset states
    setCollateralAsset("");
    setLoanAsset("");
    setCollateralAssetTouched(false);
    setLoanAssetTouched(false);
    setShowOracleDetails(false); // Hide oracle details when network changes
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
                The goal of the <strong>Oracle Suggestor</strong> is to retrieve
                the already deployed oracles for a given collateral and loan
                asset.
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
                    onChange={handleNetworkChange}
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
                    value={assets.find(
                      (asset) => asset.value === collateralAsset
                    )}
                    onChange={(selectedOption) => {
                      setCollateralAsset(selectedOption?.value || "");
                      setCollateralAssetTouched(true);
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
                    value={assets.find((asset) => asset.value === loanAsset)}
                    onChange={(selectedOption) => {
                      setLoanAsset(selectedOption?.value || "");
                      setLoanAssetTouched(true);
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
              </div>
            </form>
          </div>

          <div className="checks-section">
            <h2 style={{ marginLeft: "10px" }}>Existing Oracles?</h2>
            <CheckItemOraclesDeployed
              title=""
              isVerified={deployedResult?.isValid ?? null}
              details={deployedResult?.oracleData || []} // Pass the raw data array here
              description="The following oracles have been used for the selected asset pair."
              loading={deployedLoading}
              getExplorerUrl={getExplorerUrl}
              showDetails={showOracleDetails} // Pass showOracleDetails prop
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OracleSuggestor;
