import React, { useState, useEffect } from "react";
import { processOracleData } from "../services/processor";
import CheckItem from "./CheckItem"; // Import the new CheckItem component

interface Warning {
  level: string;
  type: string;
}

const OracleDecoder = () => {
  const [oracleAddress, setOracleAddress] = useState(
    "0x90CFE73B913ee1B93EA75Aa47134b7330289a458"
  );
  const [txCreation, setTxCreation] = useState(
    "0xb2009ab364305f83bc6cc54d0be8054a19bd38222622da881786110a8a2f13fb"
  );
  const [collateralAsset, setCollateralAsset] = useState("");
  const [loanAsset, setLoanAsset] = useState("");
  const [oracleAddressTouched, setOracleAddressTouched] = useState(false);
  const [txCreationTouched, setTxCreationTouched] = useState(false);
  const [collateralAssetTouched, setCollateralAssetTouched] = useState(false);
  const [loanAssetTouched, setLoanAssetTouched] = useState(false);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submit animation

  // eslint-disable-next-line
  const [verificationStatus, setVerificationStatus] = useState<string | null>(
    null
  );
  const [baseTokenDecimals, setBaseTokenDecimals] = useState<number | null>(
    null
  );
  const [quoteTokenDecimals, setQuoteTokenDecimals] = useState<number | null>(
    null
  );
  const [reconstructedPrice, setReconstructedPrice] = useState<number | null>(
    null
  );
  const [oraclePrice, setOraclePrice] = useState<number | null>(null);

  const [decimalCheck, setDecimalCheck] = useState<boolean | null>(null);
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
        txCreationTouched &&
        collateralAssetTouched &&
        loanAssetTouched &&
        oracleAddress.trim() !== "" &&
        txCreation.trim() !== "" &&
        collateralAsset.trim() !== "" &&
        loanAsset.trim() !== ""
    );
  }, [
    oracleAddress,
    txCreation,
    collateralAsset,
    loanAsset,
    oracleAddressTouched,
    txCreationTouched,
    collateralAssetTouched,
    loanAssetTouched,
  ]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true); // Set submitting state to true
    const originalLog = console.log;
    const logMessages: string[] = [];
    console.log = (...args) => {
      logMessages.push(args.join(" "));
      originalLog(...args);
    };

    const result = await processOracleData(
      oracleAddress,
      txCreation,
      collateralAsset,
      loanAsset,
      options
    );

    if (result) {
      const { decimalComparison, priceComparison, warningCheck } = result;

      if (decimalComparison) {
        if (decimalComparison.isVerified) {
          setVerificationStatus("✅ The oracle data matches the market data.");
          setBaseTokenDecimals(decimalComparison.baseTokenDecimals ?? null);
          setQuoteTokenDecimals(decimalComparison.quoteTokenDecimals ?? null);
          setDecimalCheck(true);
        } else {
          setVerificationStatus(
            "❌ The oracle data does not match the market data."
          );
          setBaseTokenDecimals(
            decimalComparison.baseTokenDecimalsProvided ?? null
          );
          setQuoteTokenDecimals(
            decimalComparison.quoteTokenDecimalsProvided ?? null
          );
          setDecimalCheck(false);
        }
      }

      if (priceComparison) {
        setReconstructedPrice(priceComparison.reconstructedPrice ?? null);
        setOraclePrice(priceComparison.oraclePrice ?? null);
        setPriceCheck(priceComparison.isVerified);
      }

      setWarningCheck(warningCheck); // Set warning check state
    }

    setIsSubmitting(false); // Set submitting state to false
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "30px",
        maxWidth: "1000px",
      }}
    >
      <h1>Oracle Decoder</h1>
      <div
        style={{
          backgroundColor: "#f9f9f9",
          borderRadius: "5px",
          border: "1px solid #ccc",
          padding: "10px",
          fontStyle: "italic",
          marginBottom: "20px",
        }}
      >
        <p style={{ fontSize: "0.8rem" }}>
          Note: This is currently only supporting oracles deployed from the
          MorphoChainlinkOracleV2Factory on Ethereum mainnet.
        </p>
        <p style={{ fontSize: "0.8rem" }}>
          Expect Improvement very soon, Please retrieve:
        </p>
        <p style={{ fontSize: "0.8rem" }}></p>
        <ol style={{ fontSize: "0.8rem" }}>
          <li>The oracle address deployed.</li>
          <li>The transaction creation.</li>
          <li>
            The collateral asset of the market one is expecting to use this
            oracle with.
          </li>
          <li>The loan asset.</li>
        </ol>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Oracle Address:<span style={{ color: "red" }}> *</span>
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
              border: "1px solid #ccc",
              color: oracleAddressTouched ? "#000" : "#888",
            }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Transaction Creation:<span style={{ color: "red" }}> *</span>
          </label>
          <input
            type="text"
            value={txCreationTouched ? txCreation : ""}
            placeholder="0xb2009ab364305f83bc6cc54d0be8054a19bd38222622da881786110a8a2f13fb"
            onChange={(e) => {
              setTxCreation(e.target.value);
              setTxCreationTouched(true);
            }}
            style={{
              width: "600px",
              padding: "8px",
              fontSize: "0.8rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              color: txCreationTouched ? "#000" : "#888",
            }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label
            style={{ display: "block", marginBottom: "5px", marginTop: "25px" }}
          >
            Collateral Asset:<span style={{ color: "red" }}> *</span>
          </label>
          <p>respect the case: wstETH, USDC, etc</p>
          <input
            type="text"
            value={collateralAssetTouched ? collateralAsset : ""}
            placeholder="weETH"
            onChange={(e) => {
              setCollateralAsset(e.target.value);
              setCollateralAssetTouched(true);
            }}
            style={{
              width: "400px",
              fontSize: "0.8rem",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              color: collateralAssetTouched ? "#000" : "#888",
            }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Loan Asset:<span style={{ color: "red" }}> *</span>
          </label>
          <input
            type="text"
            value={loanAssetTouched ? loanAsset : ""}
            placeholder="USDC"
            onChange={(e) => {
              setLoanAsset(e.target.value);
              setLoanAssetTouched(true);
            }}
            style={{
              width: "400px",
              fontSize: "0.8rem",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              color: loanAssetTouched ? "#000" : "#888",
            }}
          />
        </div>
        <p style={{ fontSize: "0.9rem", color: "#555" }}>
          Add those tokens where you expect to verify that this oracle seems
          well configured.
        </p>
        <button
          type="submit"
          disabled={!isSubmitEnabled || isSubmitting} // Disable while submitting
          style={{
            padding: "10px 20px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: isSubmitEnabled ? "#007BFF" : "#ccc",
            color: "#fff",
            cursor: isSubmitEnabled ? "pointer" : "not-allowed",
            opacity: isSubmitting ? 0.6 : 1, // Add opacity to indicate submission
          }}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>

      <h2>Checks</h2>
      {decimalCheck !== null && (
        <CheckItem
          title="Decimals Check"
          isVerified={decimalCheck}
          details={`Base Token Decimals: ${baseTokenDecimals}, Quote Token Decimals: ${quoteTokenDecimals}`}
        />
      )}
      {priceCheck !== null && (
        <CheckItem
          title="Price Check"
          isVerified={priceCheck}
          details={`Reconstructed Price: ${reconstructedPrice}, Oracle Price: ${oraclePrice}`}
        />
      )}
      <p>
        The following check is for market(s) using the same oracle, collat and
        loan asset
      </p>
      {warningCheck !== null && (
        <CheckItem
          title="Warning Check"
          isVerified={warningCheck.isVerified}
          details={warningCheck.warnings
            .map((w) => `${w.level}: ${w.type}`)
            .join(", ")}
        />
      )}
      {options.performDecimalCheck && decimalCheck === null && (
        <CheckItem title="Decimals Check" isVerified={null} details="Standby" />
      )}
      {options.performPriceCheck && priceCheck === null && (
        <CheckItem title="Price Check" isVerified={null} details="Standby" />
      )}
      {options.performWarningCheck && warningCheck === null && (
        <CheckItem title="Warning Check" isVerified={null} details="Standby" />
      )}
    </div>
  );
};

export default OracleDecoder;
