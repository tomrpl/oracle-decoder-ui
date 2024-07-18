import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import OracleDecoder from "./component/OracleDecoder";
// import OracleSuggestor from "./component/OracleSuggestor"; // Import your second page component
import OracleTestor from "./component/OracleTestor";
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<OracleDecoder />} />
          {/* <Route path="/second-page" element={<OracleSuggestor />} /> */}
          <Route path="/testor-page" element={<OracleTestor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
