import React from "react";

interface CheckItemProps {
  title: string;
  isVerified: boolean | null;
  details?: string;
  description?: string;
  loading?: boolean;
  error?: string;
}

const CheckItemSuggestor: React.FC<CheckItemProps> = ({
  title,
  isVerified,
  details,
  description,
  loading,
  error,
}) => {
  let backgroundColor = "#e2e3e5";
  let textColor = "#6c757d";

  if (loading) {
    backgroundColor = "#fff3cd";
    textColor = "#856404";
  } else if (error) {
    backgroundColor = "#f8d7da";
    textColor = "#721c24";
  } else if (isVerified !== null) {
    backgroundColor = isVerified ? "#d4edda" : "#f8d7da";
    textColor = isVerified ? "#155724" : "#721c24";
  }

  return (
    <div
      style={{
        border: `0.5px solid ${backgroundColor}`,
        borderRadius: "8px",
        padding: "10px",
        margin: "10px 0",
        backgroundColor: backgroundColor,
        color: textColor,
      }}
    >
      <h2 style={{ margin: "0" }}>{title}</h2>
      {description && (
        <p
          style={{
            fontSize: "0.8rem",
            color: "#6c757d",
            fontStyle: "italic",
          }}
        >
          {description}
        </p>
      )}
      {loading ? (
        <p style={{ margin: "0", fontSize: "0.9rem" }}>Loading...</p>
      ) : error ? (
        <p style={{ margin: "0", fontSize: "0.9rem" }}>Error: {error}</p>
      ) : (
        <p style={{ margin: "0", fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>
          {isVerified === null ? "" : isVerified ? "✅" : "❌"}{" "}
          {isVerified === null ? "" : details}
        </p>
      )}
    </div>
  );
};

export default CheckItemSuggestor;
