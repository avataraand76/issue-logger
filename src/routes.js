// src/routes.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ReportIssuePage from "./pages/ReportIssuePage";
// import IssueListPage from "./pages/IssueListPage";
import MachineryPage from "./pages/MachineryPage";
import PeoplePage from "./pages/PeoplePage";
import MaterialsPage from "./pages/MaterialsPage";
import MethodPage from "./pages/MethodPage";
import OtherPage from "./pages/OtherPage";
import MachineryRemediationPage from "./pages/MachineryRemediationPage";
import ResponsiblePersonPage from "./pages/ResponsiblePersonPage";
import IssueListPage from "./pages/IssueListPage";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/report-issue" element={<ReportIssuePage />} />
        <Route path="/issue-list" element={<IssueListPage />} />
        <Route path="/machinery" element={<MachineryPage />} />
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/materials" element={<MaterialsPage />} />
        <Route path="/method" element={<MethodPage />} />
        <Route path="/other" element={<OtherPage />} />
        <Route
          path="/machineryremediation"
          element={<MachineryRemediationPage />}
        />
        <Route path="/responsibleperson" element={<ResponsiblePersonPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
