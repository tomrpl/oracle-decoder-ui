import React, { useState } from "react";
import { BiCheckDouble, BiError, BiCaretDown, BiCaretUp } from "react-icons/bi";
import { ErrorTypes, ErrorMessages } from "../../services/errorTypes";

interface FeedMetadata {
  address: string;
  vendor: string;
  description: string;
  pair: [string, string] | null;
  chainId: number;
}

interface FeedsMetadata {
  baseVault: FeedMetadata | null;
  baseFeed1: FeedMetadata | null;
  baseFeed2: FeedMetadata | null;
  quoteFeed1: FeedMetadata | null;
  quoteFeed2: FeedMetadata | null;
  quoteVault: FeedMetadata | null;
}

interface CheckItemFeedsProps {
  title: string;
  isVerified: boolean | null;
  isHardcoded: boolean | null;
  details?: string;
  description?: string;
  loading?: boolean;
  feedsMetadata?: FeedsMetadata;
  errors?: ErrorTypes[];
}

const CheckItemFeeds: React.FC<CheckItemFeedsProps> = ({
  title,
  isVerified,
  isHardcoded,
  details,
  description,
  loading,
  feedsMetadata,
  errors,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const backgroundColor =
    isVerified === null
      ? "#e2e3e5"
      : isHardcoded
      ? "#ffeeba"
      : isVerified
      ? "#d4edda"
      : "#f8d7da";

  const textColor =
    isVerified === null ? "#6c757d" : isVerified ? "#155724" : "#721c24";

  const formatDescription = (feeds: FeedsMetadata) => {
    if (isHardcoded) {
      return (
        <p style={{ color: "#856404", fontStyle: "italic" }}>
          All feeds are set to zero. You might want to check if this is done on
          purpose.
        </p>
      );
    }

    return (
      <>
        {feeds.baseVault && (
          <p>
            <strong>Base Vault:</strong> {feeds.baseVault.description}
          </p>
        )}
        {feeds.baseFeed1 && (
          <p>
            <strong>Base Feed 1:</strong> {feeds.baseFeed1.vendor} -{" "}
            {feeds.baseFeed1.description}
          </p>
        )}
        {feeds.baseFeed2 && (
          <p>
            <strong>Base Feed 2:</strong> {feeds.baseFeed2.vendor} -{" "}
            {feeds.baseFeed2.description}
          </p>
        )}
        {feeds.quoteFeed1 && (
          <p>
            <strong>Quote Feed 1:</strong> {feeds.quoteFeed1.vendor} -{" "}
            {feeds.quoteFeed1.description}
          </p>
        )}
        {feeds.quoteFeed2 && (
          <p>
            <strong>Quote Feed 2:</strong> {feeds.quoteFeed2.vendor} -{" "}
            {feeds.quoteFeed2.description}
          </p>
        )}
        {feeds.quoteVault && (
          <p>
            <strong>Quote Vault:</strong> {feeds.quoteVault.description}
          </p>
        )}
      </>
    );
  };
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
          <strong>{details}</strong>
        </p>
      )}
      {isOpen && (feedsMetadata || (errors && errors.length > 0)) && (
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
              {feedsMetadata && (
                <div style={{ marginTop: "10px" }}>
                  {formatDescription(feedsMetadata)}
                  {Object.entries(feedsMetadata).map(([key, feed]) => {
                    if (feed) {
                      return (
                        <div key={key} style={{ marginBottom: "10px" }}>
                          <p style={{ margin: "0", fontSize: "0.8rem" }}>
                            <strong>{key}:</strong>
                          </p>
                          <p style={{ margin: "0", fontSize: "0.8rem" }}>
                            <strong>Address:</strong> {feed.address}
                          </p>
                          <p style={{ margin: "0", fontSize: "0.8rem" }}>
                            <strong>Oracle Vendor:</strong> {feed.vendor}
                          </p>
                          <p style={{ margin: "0", fontSize: "0.8rem" }}>
                            <strong>Description:</strong> {feed.description}
                          </p>
                          <p style={{ margin: "0", fontSize: "0.8rem" }}>
                            <strong>Pair:</strong>{" "}
                            {feed.pair ? feed.pair.join(" / ") : "N/A"}
                          </p>
                          <p style={{ margin: "0", fontSize: "0.8rem" }}>
                            <strong>Chain ID:</strong> {feed.chainId}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })}
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

export default CheckItemFeeds;
