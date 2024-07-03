import React, { useState, useEffect } from "react";
import CheckItem from "./CheckItem";
import Select from "react-select";
import useFetchOracleData from "../hooks/useFetchOracleData";
import useDecimalCheck from "../hooks/useDecimalCheck";
import useWarningCheck from "../hooks/useWarningCheck";
import "./OracleDecoder.css";
import { queryAsset } from "../services/fetchers/fetchAPI";
import { ErrorMessages, LoadingStates } from "../services/errorTypes";

const ethLogo = "https://cdn.morpho.org/assets/chains/eth.svg";
const baseLogo = "https://cdn.morpho.org/assets/chains/base.png";

const OracleDecoder = () => {
  const [oracleAddress, setOracleAddress] = useState(
    "0x90CFE73B913ee1B93EA75Aa47134b7330289a458"
  );
  const [collateralAsset, setCollateralAsset] = useState("");
  const [loanAsset, setLoanAsset] = useState("");
  const [assets, setAssets] = useState<{ value: string; label: string }[]>([]);
  const [oracleAddressTouched, setOracleAddressTouched] = useState(false);
  const [collateralAssetTouched, setCollateralAssetTouched] = useState(false);
  const [loanAssetTouched, setLoanAssetTouched] = useState(false);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [submitStarted, setSubmitStarted] = useState(false);

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

  console.log("first hook");
  const {
    loadingState,
    errors,
    oracleData,
    marketData,
    fetchOracleDataDetails,
  } = useFetchOracleData();

  console.log("second hook");
  const {
    loading: decimalLoading,
    error: decimalError,
    result: decimalResult,
  } = useDecimalCheck(
    oracleData?.baseTokenDecimals,
    oracleData?.quoteTokenDecimals,
    marketData?.markets,
    collateralAsset,
    loanAsset,
    true
  );

  const {
    loading: warningLoading,
    error: warningError,
    result: warningResult,
  } = useWarningCheck(marketData?.markets, collateralAsset, loanAsset, true);

  useEffect(() => {
    setIsSubmitEnabled(
      oracleAddressTouched &&
        collateralAssetTouched &&
        loanAssetTouched &&
        oracleAddress.trim() !== "" &&
        collateralAsset.trim() !== "" &&
        loanAsset.trim() !== ""
    );
  }, [
    oracleAddress,
    collateralAsset,
    loanAsset,
    oracleAddressTouched,
    collateralAssetTouched,
    loanAssetTouched,
  ]);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const assets = await queryAsset(selectedNetwork.value);
        const formattedAssets = assets.map((asset: any) => ({
          value: asset.symbol,
          label: asset.symbol,
        }));
        setAssets(formattedAssets);
      } catch (error) {
        console.error("Error fetching assets:", error);
      }
    };

    fetchAssets();
  }, [selectedNetwork]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStarted(true);

    setCountdown(5);
    const countdownInterval = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(countdownInterval);
        }
        return prevCountdown - 1;
      });
    }, 1000);

    await fetchOracleDataDetails(oracleAddress, selectedNetwork.value);

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

  return (
    <div className="oracle-decoder">
      <div className="oracle-container">
        <div className="header">
          <div className="form-section">
            <h1>Oracle Decoder</h1>
            <div className="instructions">
              <p>
                Note: This is currently only supporting oracles deployed from
                the MorphoChainlinkOracleV2Factory on Ethereum mainnet.
              </p>
              <p>Expect improvements very soon.</p>
              <p>Please retrieve:</p>
              <ol>
                <li>
                  The <strong>oracle address</strong> deployed.
                </li>
                <li>
                  The <strong>collateral asset</strong> of the market one is
                  expecting to use this oracle with.
                </li>
                <li>
                  The <strong>loan asset</strong> of the market one is expecting
                  to use this oracle with.
                </li>
              </ol>
            </div>
            <h2>Inputs</h2>
            <form onSubmit={handleSubmit}>
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
                      width: "400px",
                    }),
                  }}
                  placeholder="Select a network"
                />
              </div>
              <div className="inputs-section">
                <label className="label">
                  Oracle Address:
                  <span style={{ color: "var(--ifm-color-red)" }}> *</span>
                </label>
                <input
                  type="text"
                  value={oracleAddressTouched ? oracleAddress : ""}
                  placeholder="0x90CFE73B913ee1B93EA75Aa47134b7330289a458"
                  onChange={(e) => {
                    setOracleAddress(e.target.value);
                    setOracleAddressTouched(true);
                  }}
                  className="input"
                  style={{
                    color: oracleAddressTouched
                      ? "var(--ifm-color-dark-700)"
                      : "#888",
                  }}
                />
              </div>
              <div className="inputs-section">
                <label className="label">
                  Collateral Asset Supported (on this network):
                  <span style={{ color: "var(--ifm-color-red)" }}> *</span>
                </label>
                <Select
                  options={assets}
                  onChange={(selectedOption) => {
                    setCollateralAsset(selectedOption?.value || "");
                    setCollateralAssetTouched(true);
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      fontSize: "0.8rem",
                      width: "400px",
                    }),
                  }}
                  placeholder="Select an asset"
                />
              </div>
              <div className="inputs-section">
                <label className="label">
                  Loan Asset Supported (on this network):
                  <span style={{ color: "var(--ifm-color-red)" }}> *</span>
                </label>
                <Select
                  options={assets}
                  onChange={(selectedOption) => {
                    setLoanAsset(selectedOption?.value || "");
                    setLoanAssetTouched(true);
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      fontSize: "0.8rem",
                      width: "400px",
                    }),
                  }}
                  placeholder="Select an asset"
                />
              </div>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--ifm-color-dark-500)",
                }}
              >
                Add those tokens where you expect to verify that this oracle
                seems well configured.
              </p>
              <div style={{ textAlign: "right" }}>
                <button
                  type="submit"
                  disabled={!isSubmitEnabled || isSubmitting}
                  className="submit-button"
                  style={{ opacity: isSubmitting ? 0.6 : 1 }}
                >
                  {isSubmitting ? `Submitting... (${countdown})` : "Submit"}
                </button>
              </div>
            </form>
          </div>
          <div className="checks-section">
            <h1>Checks - Post Submit</h1>
            <div className="instructions">
              <p>
                The <strong>warning</strong> check is for market(s) using the
                same oracle, collat and loan asset
              </p>
            </div>

            {submitStarted &&
              loadingState === LoadingStates.COMPLETED &&
              errors.map((error, index) => (
                <div key={index} className="error-message">
                  <p>Error: {ErrorMessages[error]}</p>
                </div>
              ))}

            {decimalResult && (
              <CheckItem
                title="Decimals Check"
                isVerified={decimalResult.isVerified}
                details={
                  decimalResult.isVerified
                    ? `Base Token Decimals: ${decimalResult.baseTokenDecimalsProvided}, 
Quote Token Decimals: ${decimalResult.quoteTokenDecimalsProvided}`
                    : `Base Token Decimals: 
Provided: ${decimalResult.baseTokenDecimalsProvided}, Expected: ${decimalResult.baseTokenDecimalsExpected} 
Quote Token Decimals: 
Provided: ${decimalResult.quoteTokenDecimalsProvided}, Expected: ${decimalResult.quoteTokenDecimalsExpected}`
                }
                description={
                  `verify that the BaseTokenDecimal and QuoteTokenDecimal has been the right one at oracle creation, ` +
                  `based on the loan and collateral token.`
                }
                loading={decimalLoading}
              />
            )}
            {warningResult && (
              <CheckItem
                title="Warning Check"
                isVerified={warningResult.isVerified}
                details={warningResult.warnings
                  .map((w: any) => `${w.level}: ${w.type}`)
                  .join(", ")}
                description={
                  `return any oracle related warning, where a market is using this oracle ` +
                  `with the same loan and collat as the one in input.`
                }
                loading={warningLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OracleDecoder;
