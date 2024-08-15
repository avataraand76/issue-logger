// src/routes.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ReportIssuePage from "./pages/ReportIssuePage";
import IssueListPage from "./pages/IssueListPage";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/report-issue" element={<ReportIssuePage />} />
        <Route path="/issue-list" element={<IssueListPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
