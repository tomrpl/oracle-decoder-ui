import React, { useState } from "react";
import { BiCheckDouble, BiError, BiCaretDown, BiCaretUp } from "react-icons/bi";
import { ErrorTypes, ErrorMessages } from "../../services/errorTypes";

interface CheckItemProps {
  title: string;
  isVerified: boolean | null;
  details?: {
    scaleFactor: string;
    oraclePrice: string;
    oraclePriceUnscaled: string;
    priceUnscaledInCollateralTokenDecimals: string;
    collateralPriceUsd: string;
    loanPriceUsd: string;
    ratioUsdPrice: string;
    oraclePriceEquivalent: string;
    percentageDifference: string;
  };
  description?: string;
  loading?: boolean;
  errors?: ErrorTypes[];
}

const formatNumber = (num: string, decimals = 2) => {
  const parsedNum = parseFloat(num);
  if (isNaN(parsedNum)) return num;
  if (Math.abs(parsedNum) < 0.01) return parsedNum.toExponential(2);
  return parsedNum.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const CheckItemPrice: React.FC<CheckItemProps> = ({
  title,
  isVerified,
  details,
  description,
  loading,
  errors,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const backgroundColor =
    isVerified === null ? "#e2e3e5" : isVerified ? "#d4edda" : "#f8d7da";
  const textColor =
    isVerified === null ? "#6c757d" : isVerified ? "#155724" : "#721c24";

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const renderDetailItem = (
    label: string,
    value: string,
    formattedValue?: string
  ) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "8px",
      }}
    >
      <span
        style={{
          fontWeight: "bold",
          marginRight: "4px",
          whiteSpace: "nowrap",
        }}
      >
        {label}:
      </span>
      <span
        style={{
          fontFamily: "monospace",
          textAlign: "right",
          letterSpacing: "-0.05em",
        }}
      >
        {formattedValue ? (
          <>
            <span>{value}</span>
            <span style={{ marginLeft: "8px", color: "#666" }}>
              → {formattedValue}
            </span>
          </>
        ) : (
          value
        )}
      </span>
    </div>
  );

  return (
    <div
      style={{
        border: `0.5px solid ${backgroundColor}`,
        borderRadius: "8px",
        padding: "10px",
        margin: "10px 0 0 0",
        backgroundColor: backgroundColor,
        color: textColor,
        overflowY: "auto",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        onClick={handleToggle}
      >
        {isOpen ? <BiCaretUp /> : <BiCaretDown />}
        <h2 style={{ margin: "2px", fontSize: "1rem", marginLeft: "8px" }}>
          {title}{" "}
          {isVerified === null ? (
            ""
          ) : isVerified ? (
            <BiCheckDouble />
          ) : (
            <BiError />
          )}
        </h2>
      </div>
      {description && (
        <p
          style={{
            fontSize: "0.7rem",
            color: "#6c757d",
            fontStyle: "italic",
            margin: "1px",
          }}
        >
          {description}
        </p>
      )}
      {details && (
        <p style={{ marginTop: "10px", fontSize: "0.9rem" }}>
          <strong>Deviation:</strong>{" "}
          {formatNumber(details.percentageDifference, 2)}%
        </p>
      )}
      {isOpen && (details || (errors && errors.length > 0)) && (
        <div
          style={{
            background: "white",
            borderRadius: "4px",
            padding: "0.3rem",
            marginTop: "10px",
          }}
        >
          {loading ? (
            <p style={{ margin: "0", fontSize: "0.7rem" }}>Loading...</p>
          ) : (
            <>
              {details && (
                <div style={{ fontSize: "0.8rem", margin: "0" }}>
                  {renderDetailItem(
                    "Scale Factor",
                    details.scaleFactor,
                    formatNumber(details.scaleFactor)
                  )}
                  {renderDetailItem(
                    "Oracle Price",
                    details.oraclePrice,
                    formatNumber(details.oraclePrice, 0)
                  )}
                  {renderDetailItem(
                    "Price in Collateral Token Decimals",
                    formatNumber(
                      details.priceUnscaledInCollateralTokenDecimals,
                      4
                    )
                  )}
                  {renderDetailItem(
                    "Collateral USD Price",
                    `$${formatNumber(details.collateralPriceUsd)}`
                  )}
                  {renderDetailItem(
                    "Loan USD Price",
                    `$${formatNumber(details.loanPriceUsd)}`
                  )}
                  <div
                    style={{
                      marginTop: "15px",
                      fontWeight: "bold",
                      color: "blue",
                    }}
                  >
                    {renderDetailItem(
                      "Ratio USD Price",
                      formatNumber(details.ratioUsdPrice, 4)
                    )}
                    {renderDetailItem(
                      "Oracle price equivalent",
                      formatNumber(details.oraclePriceEquivalent, 4)
                    )}
                    {renderDetailItem(
                      "Deviation",
                      `${formatNumber(details.percentageDifference, 2)}%`
                    )}
                  </div>
                </div>
              )}
              {errors && errors.length > 0 && (
                <div style={{ marginTop: "10px", color: "red" }}>
                  {errors.map((error, index) => (
                    <p key={index} style={{ margin: "0", fontSize: "0.8rem" }}>
                      {ErrorMessages[error] || error}
                    </p>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckItemPrice;
