import React, { useState } from "react";
import { BiCheckDouble, BiError, BiCaretDown, BiCaretUp } from "react-icons/bi";
import { ErrorTypes } from "../../services/errorTypes";

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
    percentageDifference: string;
  };
  description?: string;
  loading?: boolean;
  errors?: ErrorTypes[];
}

const formatNumber = (num: string, decimals = 2) => {
  return parseFloat(num).toFixed(decimals);
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
          {formatNumber(details.percentageDifference, 0)} %
        </p>
      )}
      {isOpen && (
        <>
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
              details && (
                <div
                  style={{
                    fontSize: "0.8rem",
                    margin: "0",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <p>
                    <strong>Scale Factor:</strong> {details.scaleFactor}
                    {" → "}
                    {formatNumber(details.scaleFactor)}
                  </p>
                  <p>
                    <strong>Oracle Price:</strong> {details.oraclePrice}
                    {" → "}
                    {formatNumber(details.oraclePrice)}
                  </p>
                  <p>
                    <strong>Price in Collateral Token Decimals:</strong>{" "}
                    {formatNumber(
                      details.priceUnscaledInCollateralTokenDecimals,
                      2
                    )}
                  </p>
                  <p>
                    <strong>Collateral USD Price:</strong> $
                    {formatNumber(details.collateralPriceUsd)}
                  </p>
                  <p>
                    <strong>Loan USD Price:</strong> $
                    {formatNumber(details.loanPriceUsd)}
                  </p>
                  <p>
                    <strong> {"  "} </strong>
                  </p>
                  <p>
                    <strong> Ratio USD Price:</strong>{" "}
                    {formatNumber(details.ratioUsdPrice)}
                  </p>
                  <p>
                    <strong> Oracle price equivalent:</strong>{" "}
                    {formatNumber(
                      details.priceUnscaledInCollateralTokenDecimals,
                      2
                    )}
                  </p>
                  <p>
                    <strong>
                      {" "}
                      Deviation: {formatNumber(
                        details.percentageDifference,
                        2
                      )}{" "}
                      %
                    </strong>
                  </p>
                  {errors && errors.length > 0 && (
                    <div style={{ marginTop: "10px", color: "red" }}>
                      {errors.map((error, index) => (
                        <p
                          key={index}
                          style={{ margin: "0", fontSize: "0.8rem" }}
                        >
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CheckItemPrice;
