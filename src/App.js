import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import OracleDecoder from "./component/OracleDecoder";
import OracleTestor from "./component/OracleTestor";
import OracleSuggestor from "./component/OracleSuggestor";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<OracleDecoder />} />
          <Route path="/testor-page" element={<OracleTestor />} />
          <Route path="/suggestor-page" element={<OracleSuggestor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
