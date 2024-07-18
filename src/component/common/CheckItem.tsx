import React from "react";
import { BiCheckDouble, BiError } from "react-icons/bi";
interface CheckItemProps {
  title: string;
  isVerified: boolean | null;
  details?: string;
  description?: string;
  loading?: boolean;
}

const CheckItem: React.FC<CheckItemProps> = ({
  title,
  isVerified,
  details,
  description,
  loading,
}) => {
  const backgroundColor =
    isVerified === null ? "#e2e3e5" : isVerified ? "#d4edda" : "#f8d7da";
  const textColor =
    isVerified === null ? "#6c757d" : isVerified ? "#155724" : "#721c24";

  return (
    <div
      style={{
        border: `0.5px solid ${backgroundColor}`,
        borderRadius: "8px",
        padding: "10px",
        margin: "10px 0 0 0",
        backgroundColor: backgroundColor,
        color: textColor,
        maxHeight: "130px",
        overflowY: "auto",
      }}
    >
      <h2 style={{ margin: "2px", fontSize: "1rem" }}>
        {title}
        {isVerified === null ? (
          ""
        ) : isVerified ? (
          <BiCheckDouble />
        ) : (
          <BiError />
        )}
      </h2>
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
      {loading ? (
        <p style={{ margin: "0", fontSize: "0.9rem" }}>Loading...</p>
      ) : (
        <p style={{ margin: "0", fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>
          {isVerified === null
            ? ""
            : `
${details}`}
        </p>
      )}
    </div>
  );
};

export default CheckItem;
