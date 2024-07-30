import React, { useState } from "react";
import { BiCheckDouble, BiError, BiCaretDown, BiCaretUp } from "react-icons/bi";

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
  const [isOpen, setIsOpen] = useState(false);

  const backgroundColor =
    isVerified === null ? "#e2e3e5" : isVerified ? "#d4edda" : "#ffeeba";
  const textColor =
    isVerified === null ? "#6c757d" : isVerified ? "#155724" : "#6c757d";
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
        maxHeight: "130px",
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
                  <p>{details}</p>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CheckItem;
