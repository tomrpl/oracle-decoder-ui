import React, { useState } from "react";
import { BiCheckDouble, BiError, BiCaretDown, BiCaretUp } from "react-icons/bi";
import { ErrorTypes, ErrorMessages } from "../../services/errorTypes";

interface FeedMetadata {
  address: string;
  vendor: string;
  description: string;
  pair: [string, string] | null;
  chainId: number;
  position: "Base 1" | "Base 2" | "Quote 1" | "Quote 2";
}

interface CheckItemFeedsProps {
  title: string;
  isVerified: boolean | null;
  isHardcoded: boolean | null;
  details?: string;
  description?: string;
  loading?: boolean;
  feedsMetadata?: FeedMetadata[];
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

  const formatDescription = (feeds: FeedMetadata[]) => {
    if (isHardcoded) {
      return (
        <p style={{ color: "#856404", fontStyle: "italic" }}>
          All feeds are set to zero. You might want to check if this is done on
          purpose.
        </p>
      );
    }

    return feeds
      .filter(
        (feed) => feed.address !== "0x0000000000000000000000000000000000000000"
      )
      .map((feed, index) => (
        <React.Fragment key={index}>
          <strong>{feed.position}:</strong> {feed.description}
          <br />
        </React.Fragment>
      ));
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
                  <p
                    style={{
                      margin: "0",
                      fontSize: "0.9rem",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {formatDescription(feedsMetadata)}
                    {"\n "}
                  </p>
                  {feedsMetadata.map((feed, index) => (
                    <div key={index} style={{ marginBottom: "10px" }}>
                      <p style={{ margin: "0", fontSize: "0.8rem" }}>
                        <strong>Address:</strong> {feed.address}
                      </p>
                      <p style={{ margin: "0", fontSize: "0.8rem" }}>
                        <strong>Vendor:</strong> {feed.vendor}
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
                  ))}
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
