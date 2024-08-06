import React from "react";
import { Link, useLocation } from "react-router-dom";

interface ToggleButtonGroupProps {
  activeButton: string;
  setActiveButton: (button: string) => void;
}

const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({
  activeButton,
  setActiveButton,
}) => {
  const location = useLocation();
  const buttonStyle = {
    // ... existing styles ...
    fontFamily: "FKGrotesk, sans-serif",
    fontSize: "25px",
    fontWeight: 350,
  };
  React.useEffect(() => {
    if (location.pathname.includes("testor-page")) {
      setActiveButton("testor");
    } else if (location.pathname.includes("suggestor-page")) {
      setActiveButton("suggestor");
    } else {
      setActiveButton("decoder");
    }
  }, [location.pathname, setActiveButton]);

  return (
    <div
      className="title-container"
      style={{
        display: "flex",
        justifyContent: "left",
        alignItems: "center",
        marginBottom: "20px",
        marginTop: "15px",
      }}
    >
      <button
        onClick={() => setActiveButton("decoder")}
        style={{
          ...buttonStyle,
          position: "relative",
          backgroundColor:
            activeButton === "decoder"
              ? "var(--ifm-color-blue-base)"
              : "#f0f0f0",
          border: "none",
          cursor: "pointer",
          padding: "10px",
          color: activeButton === "decoder" ? "white" : "black",
          borderRadius: "8px",
        }}
      >
        <Link
          to="/"
          style={{ textDecoration: "none", color: "inherit", fontSize: "30px" }}
        >
          Decoder
        </Link>
      </button>

      <button
        onClick={() => setActiveButton("testor")}
        style={{
          ...buttonStyle,
          position: "relative",
          backgroundColor:
            activeButton === "testor"
              ? "var(--ifm-color-blue-base)"
              : "#f0f0f0",
          border: "none",
          cursor: "pointer",
          padding: "10px",
          color: activeButton === "testor" ? "white" : "black",
          borderRadius: "8px",
        }}
      >
        <Link
          to="/testor-page"
          style={{ textDecoration: "none", color: "inherit", fontSize: "30px" }}
        >
          Testor
        </Link>
        <span
          style={{
            position: "absolute",
            top: "-10px",
            right: "-10px",
            backgroundColor: "var(--ifm-color-blue-base)",
            color: "white",
            padding: "2px 5px",
            borderRadius: "5px",
            fontSize: "0.75rem",
          }}
        >
          New
        </span>
      </button>

      <button
        onClick={() => setActiveButton("suggestor")}
        style={{
          ...buttonStyle,
          position: "relative",
          backgroundColor:
            activeButton === "suggestor"
              ? "var(--ifm-color-blue-base)"
              : "#f0f0f0",
          border: "none",
          cursor: "pointer",
          padding: "10px",
          color: activeButton === "suggestor" ? "white" : "black",
          borderRadius: "8px",
          marginLeft: "15px",
        }}
      >
        <Link
          to="/suggestor-page"
          style={{ textDecoration: "none", color: "inherit", fontSize: "30px" }}
        >
          Suggestor
        </Link>
        <span
          style={{
            position: "absolute",
            top: "-10px",
            right: "-10px",
            backgroundColor: "var(--ifm-color-blue-base)",
            color: "white",
            padding: "2px 5px",
            borderRadius: "5px",
            fontSize: "0.75rem",
          }}
        >
          New
        </span>
      </button>
    </div>
  );
};

export default ToggleButtonGroup;
