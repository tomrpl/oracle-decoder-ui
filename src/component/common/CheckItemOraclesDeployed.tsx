import React, { useState } from "react";
import { BiCaretDown, BiCaretUp } from "react-icons/bi";
import { LoadingStates } from "../../services/errorTypes";
import { Feed, Market2 } from "../../services/fetchers/fetchAPI";

interface CheckItemProps {
  title: string;
  isVerified: boolean | null;
  details: Market2[];
  description?: string;
  loading: LoadingStates;
  getExplorerUrl: (address: string) => string;
  showDetails: boolean;
}

const CheckItemOraclesDeployed: React.FC<CheckItemProps> = ({
  title,
  isVerified,
  details,
  description,
  loading,
  getExplorerUrl,
  showDetails,
}) => {
  const [expandedOracles, setExpandedOracles] = useState<
    Record<number, boolean>
  >({});

  const toggleOracleDetails = (index: number) => {
    setExpandedOracles((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div
      style={{
        border: "1px solid #e2e3e5",
        borderRadius: "8px",
        padding: "10px",
        marginTop: "20px",
        backgroundColor: "#ffffff",
        color: "#0f0f0f",
        fontSize: "0.8rem",
        overflowY: "auto",
      }}
    >
      {showDetails && (
        <>
          <h3 style={{ marginTop: "16px", marginBottom: "8px" }}>
            List of already deployed oracles
          </h3>

          {loading === LoadingStates.COMPLETED && details.length > 0 ? (
            details.map((oracleItem, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "#2470ff10",
                  borderRadius: "8px",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
                  overflow: "hidden",
                  marginTop: "16px",
                }}
              >
                <div style={{ padding: "16px", fontSize: "0.8rem" }}>
                  <p style={{ marginBottom: "8px" }}>
                    <strong>Oracle Address:</strong>{" "}
                    <a
                      href={getExplorerUrl(oracleItem.oracle.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--ifm-color-blue-base)",
                        textDecoration: "none",
                      }}
                    >
                      {oracleItem.oracle.address}
                    </a>
                  </p>
                  <p style={{ marginBottom: "8px" }}>
                    <strong>Oracle Type:</strong> {oracleItem.oracleInfo.type}
                  </p>
                  <p style={{ marginBottom: "8px" }}>
                    <strong>Warnings:</strong>{" "}
                    {oracleItem.warnings
                      .map((w) => `${w.type} (${w.level})`)
                      .join(", ") || "None"}
                  </p>
                  <button
                    onClick={() => toggleOracleDetails(index)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: "8px",
                      color: "#3182ce",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {expandedOracles[index] ? (
                      <>
                        <BiCaretUp style={{ marginRight: "4px" }} /> Hide Info
                      </>
                    ) : (
                      <>
                        <BiCaretDown style={{ marginRight: "4px" }} /> Show Info
                      </>
                    )}
                  </button>
                </div>
                {expandedOracles[index] && oracleItem.oracle.data && (
                  <div
                    style={{
                      backgroundColor: "#f7fafc",
                      padding: "16px",
                      borderBottomLeftRadius: "8px",
                      borderBottomRightRadius: "8px",
                      fontSize: "0.7rem",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: "600",
                        marginBottom: "8px",
                        fontSize: "0.8rem",
                      }}
                    >
                      Feed Information:
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "16px",
                        fontSize: "0.6rem",
                      }}
                    >
                      <FeedInfo
                        title="Base Feed One"
                        feed={oracleItem.oracle.data.baseFeedOne}
                      />
                      <FeedInfo
                        title="Base Feed Two"
                        feed={oracleItem.oracle.data.baseFeedTwo}
                      />
                      <FeedInfo
                        title="Quote Feed One"
                        feed={oracleItem.oracle.data.quoteFeedOne}
                      />
                      <FeedInfo
                        title="Quote Feed Two"
                        feed={oracleItem.oracle.data.quoteFeedTwo}
                      />
                    </div>
                    <div
                      style={{
                        marginTop: "16px",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "16px",
                        fontSize: "0.6rem",
                      }}
                    >
                      <p>
                        <strong>Base Vault:</strong>{" "}
                        {oracleItem.oracle.data.baseVault}
                      </p>
                      <p>
                        <strong>Quote Vault:</strong>{" "}
                        {oracleItem.oracle.data.quoteVault}
                      </p>
                      <p>
                        <strong>Base Vault Conversion Sample:</strong>{" "}
                        {oracleItem.oracle.data.baseVaultConversionSample}
                      </p>
                      <p>
                        <strong>Quote Vault Conversion Sample:</strong>{" "}
                        {oracleItem.oracle.data.quoteVaultConversionSample}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p style={{ color: "#718096" }}>
              No oracle found for this asset pair.
            </p>
          )}
        </>
      )}
    </div>
  );
};

interface FeedInfoProps {
  title: string;
  feed: Feed | null;
}

const FeedInfo: React.FC<FeedInfoProps> = ({ title, feed }) => {
  if (!feed) return null;
  return (
    <div style={{ marginBottom: "8px" }}>
      <p style={{ fontWeight: "600", marginBottom: "4px" }}>{title}:</p>
      <p style={{ margin: "2px 0" }}>
        <strong>Address:</strong> {feed.address}
      </p>
      <p style={{ margin: "2px 0" }}>
        <strong>Description:</strong> {feed.description}
      </p>
      <p style={{ margin: "2px 0" }}>
        <strong>Vendor:</strong> {feed.vendor}
      </p>
    </div>
  );
};

export default CheckItemOraclesDeployed;
