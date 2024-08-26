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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
} from "@mui/material";
import Header from "../components/Header";
import IssueFilters from "../components/IssueFilters";
import IssueDetails from "../components/IssueDetails";
import { useNavigate } from "react-router-dom";
import { format, parse, isValid, isToday } from "date-fns";
import LoadingAnimation from "../components/LoadingAnimation";
import { fetchIssues, addIssue } from "../data/api";
import AutofillPreventer from "../components/AutofillPreventer";
import Pagination from "../components/Pagination";
import peopleList from "../data/peopleList";

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
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [reportData, setReportData] = useState({
    lineNumber: "",
    stationNumber: "",
    scope: "",
    responsiblePerson: "",
  });
  const [teamLeader, setTeamLeader] = useState("");

  const handleOpenReportDialog = () => {
    setOpenReportDialog(true);
  };

  const handleCloseReportDialog = () => {
    setOpenReportDialog(false);
    setReportData({
      lineNumber: "",
      stationNumber: "",
      scope: "",
      responsiblePerson: "",
    });
  };

  const handleLineNumberChange = (event, newValue) => {
    setReportData({
      ...reportData,
      lineNumber: newValue ? newValue.label : "",
    });

    // Find and set the team leader
    if (newValue) {
      const lineNumber = newValue.label.replace("Line ", "");
      const teamLeader = peopleList.teamLeaders.find((leader) =>
        leader.includes(`TỔ TRƯỞNG TỔ ${lineNumber.padStart(2, "0")}`)
      );
      setTeamLeader(teamLeader || "");
    } else {
      setTeamLeader("");
    }
  };

  const handleReportSubmit = async () => {
    // Implement the logic to submit the report
    try {
      const data = {
        action: "addIssue",
        submissionTime: format(new Date(), "HH:mm MM/dd/yyyy", {
          timeZone: "Asia/Ho_Chi_Minh",
        }),
        ...reportData,
      };
      const result = await addIssue(data);
      if (result.status === "success") {
        // Optionally, you can update the issues list or show a success message
        handleCloseReportDialog();
        fetchIssuesData(); // Refresh the issues list
      } else {
        console.error("Failed to add issue:", result.message);
      }
    } catch (error) {
      console.error("Error adding issue:", error);
    }
  };

  const lineNumbers = [
    ...Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: `Line ${i + 1}`,
    })),
    { value: 20.01, label: "Line 20.01" },
    ...Array.from({ length: 26 }, (_, i) => ({
      value: i + 15,
      label: `Line ${i + 15}`,
    })),
    { value: 41, label: "Tổ hoàn thành 1 - xưởng 4" },
    { value: 42, label: "Tổ hoàn thành 2 - xưởng 4" },
  ];

  const stationNumbers = [
    ...Array.from({ length: 80 }, (_, i) => ({
      value: i + 1,
      label: `${i + 1}`,
    })),
    { value: "QC", label: "QC" },
    { value: "KT", label: "KỸ THUẬT" },
    { value: "DG", label: "ĐÓNG GÓI" },
  ];

  const scopes = [
    {
      value: "Máy móc",
      label: "Máy móc",
    },
    {
      value: "Con người",
      label: "Con người",
    },
    {
      value: "Nguyên phụ liệu",
      label: "Nguyên phụ liệu",
    },
    {
      value: "Phương pháp",
      label: "Phương pháp",
    },
  ];

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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Button onClick={handleBack} variant="outlined">
            Quay lại
          </Button>
          <Button
            onClick={handleOpenReportDialog}
            variant="contained"
            color="primary"
            style={{ backgroundColor: "red" }}
          >
            Báo cáo
          </Button>
        </Box>
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
        <Dialog
          open={openReportDialog}
          onClose={handleCloseReportDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle align="center">BÁO CÁO GIÁM SÁT</DialogTitle>
          <DialogContent>
            <Autocomplete
              options={lineNumbers}
              getOptionLabel={(option) => option.label}
              onChange={handleLineNumberChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Số chuyền"
                  fullWidth
                  margin="normal"
                />
              )}
            />
            <TextField
              label="Tổ trưởng"
              value={teamLeader}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <Autocomplete
              multiple
              options={stationNumbers}
              getOptionLabel={(option) => option.label}
              onChange={(event, newValue) =>
                setReportData({
                  ...reportData,
                  stationNumber: newValue.map((v) => v.label).join(", "),
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Số trạm"
                  fullWidth
                  margin="normal"
                />
              )}
            />
            <Autocomplete
              options={scopes}
              getOptionLabel={(option) => option.label}
              onChange={(event, newValue) =>
                setReportData({
                  ...reportData,
                  scope: newValue ? newValue.value : "",
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Phạm vi vấn đề"
                  fullWidth
                  margin="normal"
                />
              )}
            />
            <Autocomplete
              options={peopleList.teamLineBalancing}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Người ghi nhận vấn đề"
                  fullWidth
                  multiline
                  margin="normal"
                />
              )}
              onChange={(event, newValue) =>
                setReportData({ ...reportData, responsiblePerson: newValue })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReportDialog}>Hủy</Button>
            <Button
              onClick={handleReportSubmit}
              variant="contained"
              color="primary"
            >
              Gửi báo cáo
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default SupervisorPage;
