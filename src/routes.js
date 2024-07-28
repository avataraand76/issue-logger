// src/routes.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ReportIssuePage from "./pages/ReportIssuePage";
import MachineryPage from "./pages/MachineryPage";
import PeoplePage from "./pages/PeoplePage";
import MaterialsPage from "./pages/MaterialsPage";
import MethodPage from "./pages/MethodPage";
import RemediationPage from "./pages/RemediationPage";
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
        <Route path="/remediation" element={<RemediationPage />} />
        <Route path="/responsibleperson" element={<ResponsiblePersonPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
