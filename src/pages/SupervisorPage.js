// src/pages/SupervisorPage.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Fade,
  Switch,
  FormControlLabel,
} from "@mui/material";
import Header from "../components/Header";
import IssueFilters from "../components/IssueFilters";
import IssueDetails from "../components/IssueDetails";
import { useNavigate } from "react-router-dom";
import { format, parse, isValid, isToday } from "date-fns";
import LoadingAnimation from "../components/LoadingAnimation";
import { fetchIssues } from "../data/api";
import AutofillPreventer from "../components/AutofillPreventer";
import Pagination from "../components/Pagination";

const SupervisorPage = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState(null);
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [issuesPerPage] = useState(20);
  const navigate = useNavigate();
  const [showUnresolvedOnly, setShowUnresolvedOnly] = useState(false);
  const [todayIssuesStats, setTodayIssuesStats] = useState({
    total: 0,
    resolved: 0,
    unresolved: 0,
  });

  useEffect(() => {
    fetchIssuesData();
  }, []);

  const isIssueFromToday = (issue) => {
    const issueDate = parse(
      issue.submissionTime,
      "HH:mm MM/dd/yyyy",
      new Date()
    );
    return isValid(issueDate) && isToday(issueDate);
  };

  const fetchIssuesData = async () => {
    setLoading(true);
    try {
      const data = await fetchIssues();
      if (Array.isArray(data)) {
        setIssues(data); // Không lọc ra các vấn đề chưa kết thúc
      } else {
        console.error("Received data is not an array:", data);
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterIssues = useCallback(() => {
    let filtered = issues.filter(isIssueFromToday);

    // Update today's issues statistics
    const resolvedIssues = filtered.filter((issue) => issue.endTime);
    setTodayIssuesStats({
      total: filtered.length,
      resolved: resolvedIssues.length,
      unresolved: filtered.length - resolvedIssues.length,
    });

    if (showUnresolvedOnly) {
      filtered = filtered.filter((issue) => !issue.endTime);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (issue) =>
          issue.lineNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(issue.stationNumber)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          issue.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (issue.responsiblePerson &&
            issue.responsiblePerson
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    if (filterDate) {
      const formattedFilterDate = format(filterDate, "MM/dd/yyyy");
      filtered = filtered.filter((issue) => {
        const issueDate = parse(
          issue.submissionTime,
          "HH:mm MM/dd/yyyy",
          new Date()
        );
        return (
          isValid(issueDate) &&
          format(issueDate, "MM/dd/yyyy") === formattedFilterDate
        );
      });
    }

    setFilteredIssues(filtered);
  }, [issues, searchTerm, filterDate, showUnresolvedOnly]);

  useEffect(() => {
    filterIssues();
  }, [issues, searchTerm, filterDate, showUnresolvedOnly, filterIssues]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleExpand = (id) => {
    setExpandedIssue(expandedIssue === id ? null : id);
  };

  const indexOfLastIssue = currentPage * issuesPerPage;
  const indexOfFirstIssue = indexOfLastIssue - issuesPerPage;
  const currentIssues = filteredIssues.slice(
    indexOfFirstIssue,
    indexOfLastIssue
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <AutofillPreventer />
        <Button
          onClick={handleBack}
          variant="outlined"
          style={{ marginBottom: "20px" }}
        >
          Quay lại
        </Button>
        <Typography variant="h4" gutterBottom>
          DANH SÁCH VẤN ĐỀ DOWNTIME - GIÁM SÁT
        </Typography>
        {loading ? (
          <LoadingAnimation />
        ) : (
          <>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={showUnresolvedOnly}
                    onChange={(e) => setShowUnresolvedOnly(e.target.checked)}
                    color="primary"
                  />
                }
                label="Chỉ hiển thị vấn đề chưa giải quyết"
              />
              <Typography>
                Tổng số vấn đề hôm nay: {todayIssuesStats.total} | Đã giải
                quyết: {todayIssuesStats.resolved} | Chưa giải quyết:{" "}
                {todayIssuesStats.unresolved}
              </Typography>
            </Box>
            <IssueFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterDate={filterDate}
              setFilterDate={setFilterDate}
            />
            <Box mt={2} mb={2}>
              <Pagination
                issuesPerPage={issuesPerPage}
                totalIssues={filteredIssues.length}
                paginate={paginate}
                currentPage={currentPage}
              />
            </Box>
            <Fade in={!loading} timeout={1000}>
              <Box>
                <IssueDetails
                  filteredIssues={currentIssues}
                  expandedIssue={expandedIssue}
                  handleExpand={handleExpand}
                  showEndIssueButton={false}
                  isSupervisorPage={true}
                />
              </Box>
            </Fade>
          </>
        )}
      </Container>
    </>
  );
};

export default SupervisorPage;
