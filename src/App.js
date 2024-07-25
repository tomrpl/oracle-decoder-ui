import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import OracleDecoder from "./component/OracleDecoder";
import OracleTestor from "./component/OracleTestor";
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<OracleDecoder />} />
          <Route path="/testor-page" element={<OracleTestor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
