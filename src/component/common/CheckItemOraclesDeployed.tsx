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
  if (!showDetails) {
    return null; // Return null if showDetails is false
  }

  const getWarningColor = (level: string) => {
    switch (level.toUpperCase()) {
      case "YELLOW":
        return "#ffa700";
      case "RED":
        return "#ff0000";
      default:
        return "#000000";
    }
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
                <div style={{ padding: "16px" }}>
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
                    {oracleItem.warnings.map((w, i) => (
                      <span
                        key={i}
                        style={{
                          color: getWarningColor(w.level),
                          marginRight: "8px",
                        }}
                      >
                        <strong>{w.type}</strong>
                      </span>
                    ))}
                    {oracleItem.warnings.length === 0 && "None"}
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
                {expandedOracles[index] && (
                  <div
                    style={{
                      backgroundColor: "#f7fafc",
                      padding: "16px",
                      borderBottomLeftRadius: "8px",
                      borderBottomRightRadius: "8px",
                      fontSize: "0.7rem",
                    }}
                  >
                    {oracleItem.oracle.data ? (
                      <>
                        {oracleItem.oracle.data.baseFeedOne ||
                        oracleItem.oracle.data.baseFeedTwo ||
                        oracleItem.oracle.data.quoteFeedOne ||
                        oracleItem.oracle.data.quoteFeedTwo ||
                        oracleItem.oracle.data.baseVault ||
                        oracleItem.oracle.data.quoteVault ||
                        oracleItem.oracle.data.baseVaultConversionSample ||
                        oracleItem.oracle.data.quoteVaultConversionSample ? (
                          <>
                            {/* Check if any feed data exists before rendering Feed Information section */}
                            {(oracleItem.oracle.data.baseFeedOne ||
                              oracleItem.oracle.data.baseFeedTwo ||
                              oracleItem.oracle.data.quoteFeedOne ||
                              oracleItem.oracle.data.quoteFeedTwo) && (
                              <>
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
                                    fontSize: "0.8rem",
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
                              </>
                            )}
                            {/* Check if any vault or conversion sample data exists before rendering */}
                            {(oracleItem.oracle.data.baseVault ||
                              oracleItem.oracle.data.quoteVault ||
                              oracleItem.oracle.data
                                .baseVaultConversionSample ||
                              oracleItem.oracle.data
                                .quoteVaultConversionSample) && (
                              <div
                                style={{
                                  marginTop: "16px",
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr",
                                  gap: "16px",
                                  fontSize: "0.8rem",
                                }}
                              >
                                {oracleItem.oracle.data.baseVault && (
                                  <p>
                                    <strong
                                      style={{
                                        color: "var(--ifm-color-blue-base)",
                                      }}
                                    >
                                      Base Vault:
                                    </strong>{" "}
                                    {oracleItem.oracle.data.baseVault}
                                  </p>
                                )}
                                {oracleItem.oracle.data.quoteVault && (
                                  <p>
                                    <strong
                                      style={{
                                        color: "var(--ifm-color-blue-base)",
                                      }}
                                    >
                                      Quote Vault:
                                    </strong>{" "}
                                    {oracleItem.oracle.data.quoteVault}
                                  </p>
                                )}
                                {oracleItem.oracle.data
                                  .baseVaultConversionSample && (
                                  <p>
                                    <strong
                                      style={{
                                        color: "var(--ifm-color-blue-base)",
                                      }}
                                    >
                                      Base Vault Conversion Sample:
                                    </strong>{" "}
                                    {
                                      oracleItem.oracle.data
                                        .baseVaultConversionSample
                                    }
                                  </p>
                                )}
                                {oracleItem.oracle.data
                                  .quoteVaultConversionSample && (
                                  <p>
                                    <strong
                                      style={{
                                        color: "var(--ifm-color-blue-base)",
                                      }}
                                    >
                                      Quote Vault Conversion Sample:
                                    </strong>{" "}
                                    {
                                      oracleItem.oracle.data
                                        .quoteVaultConversionSample
                                    }
                                  </p>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <p style={{ color: "#718096", fontStyle: "italic" }}>
                            No info for this oracle, or it might be an old
                            version. (Not a ChainlinkOracleV2)
                          </p>
                        )}
                      </>
                    ) : (
                      <p style={{ color: "#e53e3e", fontWeight: "bold" }}>
                        No info is provided on this oracle. Do not use it!
                      </p>
                    )}
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
      <p
        style={{
          fontWeight: "600",
          marginBottom: "4px",
          color: "var(--ifm-color-blue-base)",
        }}
      >
        {title}:
      </p>
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
