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
  DialogContentText,
  DialogActions,
  TextField,
  Autocomplete,
  Chip,
  CircularProgress,
  IconButton,
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
import peopleList from "../data/peopleList";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

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
  const [selectedStations, setSelectedStations] = useState([]);
  const [stationInput, setStationInput] = useState({ value: "", error: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

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
    setTeamLeader("");
    setSelectedStations([]);
    setStationInput({ value: "", error: "" });
  };

  const handleLineNumberChange = (event, newValue) => {
    setReportData({
      ...reportData,
      lineNumber: newValue ? newValue.label : "",
    });

    // Find and set the team leader(s)
    if (newValue) {
      const lineNumber = newValue.label;
      let teamLeaders = [];

      if (lineNumber === "Line 20.01A" || lineNumber === "Line 20.01B") {
        teamLeaders = peopleList.teamLeaders.filter((leader) =>
          leader.includes("TỔ TRƯỞNG TỔ 20.01")
        );
      } else if (lineNumber === "Line 20") {
        teamLeaders = peopleList.teamLeaders.filter((leader) =>
          leader.includes("TỔ TRƯỞNG TỔ 20 -")
        );
      } else if (lineNumber === "Tổ hoàn thành 1 - xưởng 4") {
        teamLeaders = peopleList.teamLeaders.filter((leader) =>
          leader.includes("TỔ TRƯỞNG TỔ HOÀN THÀNH 1")
        );
      } else if (lineNumber === "Tổ hoàn thành 2 - xưởng 4") {
        teamLeaders = peopleList.teamLeaders.filter((leader) =>
          leader.includes("TỔ TRƯỞNG TỔ HOÀN THÀNH 2")
        );
      } else {
        const lineNum = lineNumber.replace("Line ", "").padStart(2, "0");
        teamLeaders = peopleList.teamLeaders.filter((leader) =>
          leader.includes(`TỔ TRƯỞNG TỔ ${lineNum}`)
        );
      }

      setTeamLeader(teamLeaders.join("\n") || "");
    } else {
      setTeamLeader("");
    }
  };

  const handleReportSubmit = async () => {
    setIsSubmitting(true);
    try {
      const data = {
        lineNumber: reportData.lineNumber,
        stationNumber: reportData.stationNumber,
        scope: reportData.scope,
        teamLeader: teamLeader,
        responsiblePerson: reportData.responsiblePerson,
      };

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxQedxN0wbT_W7OpTA02r9mXblc40wbx9kxIAyCg37ukHF1azKP3_cWwes9ZZwq5IOU/exec",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        setShowSuccessDialog(true);
        setTimeout(() => {
          setShowSuccessDialog(false);
          handleCloseReportDialog();
          fetchIssuesData();
        }, 2000);
      } else {
        console.error("Failed to add issue:", result.message);
      }
    } catch (error) {
      console.error("Error adding issue:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const lineNumbers = [
    ...Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: `Line ${i + 1}`,
    })),
    { value: 20.01, label: "Line 20.01A" },
    { value: 20.01, label: "Line 20.01B" },
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

  const handleStationAdd = (event, newValue) => {
    if (newValue) {
      if (!selectedStations.includes(newValue.label)) {
        setSelectedStations([...selectedStations, newValue.label]);
        setStationInput({ value: "", error: "" });
        setReportData({
          ...reportData,
          stationNumber: [...selectedStations, newValue.label].join(", "),
        });
      } else {
        setStationInput({
          value: newValue.label,
          error: `ĐÃ NHẬP TRẠM ${newValue.label} RỒI!`,
        });
      }
    }
  };

  const handleStationDelete = (stationToDelete) => () => {
    const updatedStations = selectedStations.filter(
      (station) => station !== stationToDelete
    );
    setSelectedStations(updatedStations);
    setReportData({
      ...reportData,
      stationNumber: updatedStations.join(", "),
    });
  };

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
        const issuesWithType = data.map((issue) => ({
          ...issue,
          type: issue.issue ? "issue" : "supervisorReport",
        }));
        setIssues(issuesWithType);
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
    navigate("/");
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
              multiline
              minRows={2}
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <Autocomplete
              options={stationNumbers}
              getOptionLabel={(option) => option.label}
              onChange={handleStationAdd}
              value={stationInput.value ? { label: stationInput.value } : null}
              inputValue={stationInput.value}
              onInputChange={(event, newInputValue) => {
                setStationInput({ value: newInputValue, error: "" });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Số trạm"
                  fullWidth
                  margin="normal"
                  error={!!stationInput.error}
                  helperText={stationInput.error}
                />
              )}
            />
            <Box sx={{ mt: 1, mb: 2 }}>
              {selectedStations.map((station) => (
                <Chip
                  key={station}
                  label={station}
                  onDelete={handleStationDelete(station)}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
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
              options={peopleList.teamSupervisor}
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
              Gửi báo cáo giám sát
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
      <Dialog
        open={isSubmitting}
        PaperProps={{
          style: {
            backgroundColor: "transparent",
            boxShadow: "none",
            overflow: "hidden",
          },
        }}
      >
        <DialogContent style={{ textAlign: "center", padding: "40px" }}>
          <CircularProgress size={60} />
          <DialogContentText style={{ marginTop: "20px", color: "#fff" }}>
            Đang ghi dữ liệu...
          </DialogContentText>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            boxShadow: "none",
            overflow: "hidden",
          },
        }}
      >
        <DialogContent style={{ textAlign: "center", padding: "40px" }}>
          <IconButton
            color="primary"
            style={{
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <CheckCircleOutlineIcon style={{ fontSize: 60 }} />
          </IconButton>
          <DialogContentText
            id="alert-dialog-description"
            style={{ fontSize: "1.2rem" }}
          >
            Ghi nhận dữ liệu thành công!
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SupervisorPage;
