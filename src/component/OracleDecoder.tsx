import React, { useState, useEffect } from "react";
import { processOracleData } from "../services/processor";
import { queryAsset } from "../services/fetchers/fetchAPI";
import CheckItem from "./CheckItem"; // Import the new CheckItem component
import morphoWallpaper from "../logos/wallpaper.png"; // Ensure correct path
import Select from "react-select"; // Import react-select
import Modal from "react-modal";

interface Warning {
  level: string;
  type: string;
}

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
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submit animation
  const [countdown, setCountdown] = useState(5); // Countdown state
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State for error message
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false); // State for modal visibility

  // eslint-disable-next-line
  const [verificationStatus, setVerificationStatus] = useState<string | null>(
    null
  );

  // eslint-disable-next-line
  const [baseTokenDecimals, setBaseTokenDecimals] = useState<number | null>(
    null
  );

  // eslint-disable-next-line
  const [quoteTokenDecimals, setQuoteTokenDecimals] = useState<number | null>(
    null
  );
  const [reconstructedPrice, setReconstructedPrice] = useState<number | null>(
    null
  );
  const [oraclePrice, setOraclePrice] = useState<number | null>(null);

  const [decimalCheck, setDecimalCheck] = useState<{
    isVerified: boolean;
    baseTokenDecimalsProvided: number | null;
    baseTokenDecimalsExpected: number | null;
    quoteTokenDecimalsProvided: number | null;
    quoteTokenDecimalsExpected: number | null;
  } | null>(null);
  const [priceCheck, setPriceCheck] = useState<boolean | null>(null);
  const [warningCheck, setWarningCheck] = useState<{
    isVerified: boolean;
    warnings: Warning[];
  } | null>(null); // New state for warning check

  // eslint-disable-next-line
  const [options, setOptions] = useState({
    performDecimalCheck: true,
    performPriceCheck: false, // Disable in production
    performWarningCheck: true,
  });

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
        const assets = await queryAsset(1);
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
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    setCountdown(5);
    const countdownInterval = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(countdownInterval);
        }
        return prevCountdown - 1;
      });
    }, 1000);

    const result = await processOracleData(
      oracleAddress,
      collateralAsset,
      loanAsset,
      options
    );

    if (result && !result.error) {
      const { decimalComparison, priceComparison, warningCheck } = result;

      if (decimalComparison) {
        setVerificationStatus(
          decimalComparison.isVerified
            ? "✅ The oracle data matches the market data."
            : "❌ The oracle data does not match the market data."
        );
        setBaseTokenDecimals(
          decimalComparison.baseTokenDecimalsProvided ?? null
        );
        setQuoteTokenDecimals(
          decimalComparison.quoteTokenDecimalsProvided ?? null
        );
        setDecimalCheck(decimalComparison);
      }

      if (priceComparison) {
        setReconstructedPrice(priceComparison.reconstructedPrice ?? null);
        setOraclePrice(priceComparison.oraclePrice ?? null);
        setPriceCheck(priceComparison.isVerified);
      }

      setWarningCheck(warningCheck); // Set warning check state
    } else {
      setErrorMessage(
        `Address provided is not in the logs of the Oracle Factory.
Failed to get transaction hash for the oracle.
Please check the oracle address and try again.`
      );
      setIsErrorModalOpen(true);
      setWarningCheck(null); // Keep warning check in standby mode
    }

    setIsSubmitting(false); // Set submitting state to false
  };

  return (
    <div
      style={{
        backgroundImage: `url(${morphoWallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "60px",
        minHeight: "100vh",
        opacity: "1",
      }}
    >
      <div
        style={{
          fontFamily: "FKGrotesk",
          padding: "30px",
          backgroundColor: "#F0F2F7",
          borderRadius: "12px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "var(--ifm-color-dark-800)",
          }}
        >
          <div style={{ flex: 1, marginRight: "20px" }}>
            <h1>Oracle Decoder</h1>
            <div
              style={{
                backgroundColor: "var(--ifm-color-dark-0)",
                borderRadius: "8px",
                border: "0.5px solid var(--ifm-color-dark-0)",
                padding: "10px",
                marginBottom: "20px",
              }}
            >
              <p style={{ fontSize: "0.8rem" }}>
                Note: This is currently only supporting oracles deployed from
                the MorphoChainlinkOracleV2Factory on Ethereum mainnet.
              </p>
              <p style={{ fontSize: "0.8rem" }}>
                Expect improvements very soon.{" "}
              </p>
              <p style={{ fontSize: "0.8rem" }}> Please retrieve:</p>
              <ol style={{ fontSize: "0.8rem" }}>
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
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
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
                  style={{
                    width: "400px",
                    fontSize: "0.8rem",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid var(--ifm-color-dark-600)",
                    color: oracleAddressTouched
                      ? "var(--ifm-color-dark-700)"
                      : "#888",
                  }}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    marginTop: "25px",
                  }}
                >
                  Collateral Asset:
                  <span style={{ color: "var(--ifm-color-red)" }}> *</span>
                </label>
                <p style={{ fontSize: "0.8rem" }}>
                  respect the case: wstETH, USDC, etc
                </p>
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
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Loan Asset:
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
                  disabled={!isSubmitEnabled || isSubmitting} // Disable while submitting
                  style={{
                    padding: "10px 20px",
                    borderRadius: "4px",
                    border: "none",
                    backgroundColor: isSubmitEnabled
                      ? "var(--ifm-color-blue-base)"
                      : "#ccc",
                    color: "#fff",
                    cursor: isSubmitEnabled ? "pointer" : "not-allowed",
                    opacity: isSubmitting ? 0.6 : 1, // Add opacity to indicate submission
                  }}
                >
                  {isSubmitting ? `Submitting... (${countdown})` : "Submit"}
                </button>
              </div>
            </form>
          </div>
          <div style={{ flex: 1 }}>
            <h1>Checks - Post Submit</h1>
            <div
              style={{
                backgroundColor: "var(--ifm-color-dark-0)",
                borderRadius: "8px",
                border: "0.5px solid var(--ifm-color-dark-0)",
                padding: "10px",
                marginBottom: "20px",
              }}
            >
              <p style={{ fontSize: "0.8rem" }}>
                The <strong>warning</strong> check is for market(s) using the
                same oracle, collat and loan asset
              </p>
            </div>

            {decimalCheck !== null && (
              <CheckItem
                title="Decimals Check"
                isVerified={decimalCheck.isVerified}
                details={
                  decimalCheck.isVerified
                    ? `Base Token Decimals: ${decimalCheck.baseTokenDecimalsProvided}, 
Quote Token Decimals: ${decimalCheck.quoteTokenDecimalsProvided}`
                    : `Base Token Decimals: 
Provided: ${decimalCheck.baseTokenDecimalsProvided}, Expected: ${decimalCheck.baseTokenDecimalsExpected} 
Quote Token Decimals: 
Provided: ${decimalCheck.quoteTokenDecimalsProvided}, Expected: ${decimalCheck.quoteTokenDecimalsExpected}`
                }
                description={
                  `verify that the BaseTokenDecimal and QuoteTokenDecimal has been the right one at oracle creation, ` +
                  `based on the loan and collateral token.`
                }
              />
            )}
            {priceCheck !== null && (
              <CheckItem
                title="Price Check"
                isVerified={priceCheck}
                details={`Reconstructed Price: ${reconstructedPrice}, Oracle Price: ${oraclePrice}`}
              />
            )}
            {warningCheck !== null && (
              <CheckItem
                title="Warning Check"
                isVerified={warningCheck.isVerified}
                details={warningCheck.warnings
                  .map((w) => `${w.level}: ${w.type}`)
                  .join(", ")}
                description={
                  `return any oracle related warning, where a market is using this oracle ` +
                  `with the same loan and collat as the one in input.`
                }
              />
            )}
            {options.performDecimalCheck && decimalCheck === null && (
              <CheckItem
                title="Decimals Check"
                isVerified={null}
                details="Standby"
                description={
                  `verify that the BaseTokenDecimal and QuoteTokenDecimal has been the right one at oracle creation, ` +
                  `based on the loan and collateral token.`
                }
              />
            )}
            {options.performPriceCheck && priceCheck === null && (
              <CheckItem
                title="Price Check"
                isVerified={null}
                details="Standby"
              />
            )}
            {options.performWarningCheck && warningCheck === null && (
              <CheckItem
                title="Warning Check"
                isVerified={null}
                details="Standby"
                description={
                  `The check warning: ` +
                  `return any oracle related warning, where a market is using this oracle ` +
                  `with the same loan and collat as the one in input.`
                }
              />
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isErrorModalOpen}
        onRequestClose={() => setIsErrorModalOpen(false)}
        contentLabel="Error Modal"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            borderRadius: "10px",
            backgroundColor: "#fff",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <h2>Error</h2>
        <p>{errorMessage}</p>
        <button
          onClick={() => setIsErrorModalOpen(false)}
          style={{
            padding: "10px 20px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "var(--ifm-color-blue-base)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </Modal>
    </div>
  );
};

export default OracleDecoder;
