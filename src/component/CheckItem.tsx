import React from "react";

interface CheckItemProps {
  title: string;
  isVerified: boolean | null;
  details?: string;
}

const CheckItem: React.FC<CheckItemProps> = ({
  title,
  isVerified,
  details,
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
        margin: "10px 0",
        backgroundColor: backgroundColor,
        color: textColor,
      }}
    >
      <h2 style={{ margin: "0" }}>{title}</h2>
      <p style={{ margin: "0", fontSize: "0.9rem" }}>
        {isVerified === null ? "Standby" : isVerified ? "✅" : "❌"}{" "}
        {isVerified === null ? "" : details}
      </p>
    </div>
  );
};

export default CheckItem;
