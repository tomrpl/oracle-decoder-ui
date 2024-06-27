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
  const borderColor =
    isVerified === null ? "grey" : isVerified ? "green" : "red";
  const backgroundColor =
    isVerified === null ? "#e2e3e5" : isVerified ? "#d4edda" : "#f8d7da";
  const textColor =
    isVerified === null ? "#6c757d" : isVerified ? "#155724" : "#721c24";

  return (
    <div
      style={{
        border: `2px solid ${borderColor}`,
        borderRadius: "4px",
        padding: "10px",
        margin: "10px 0",
        backgroundColor: backgroundColor,
        color: textColor,
      }}
    >
      <h3 style={{ margin: "0" }}>{title}</h3>
      <p style={{ margin: "0" }}>
        {isVerified === null ? "🟡 Standby" : isVerified ? "✅" : "❌"}{" "}
        {isVerified === null ? "" : details}
      </p>
    </div>
  );
};

export default CheckItem;
