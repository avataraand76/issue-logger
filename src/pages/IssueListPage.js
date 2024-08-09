// src/pages/IssueListPage.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  CircularProgress,
  Box,
  Fade,
  IconButton,
  TextField,
  DialogActions,
  DialogTitle,
} from "@mui/material";
import Header from "../components/Header";
import IssueFilters from "../components/IssueFilters";
import IssueDetails from "../components/IssueDetails";
import { useNavigate } from "react-router-dom";
import { format, parse, isValid, differenceInMinutes } from "date-fns";
import LoadingAnimation from "../components/LoadingAnimation";
import { fetchIssues, endIssue } from "../data/api";
import AutofillPreventer from "../components/AutofillPreventer";
import Pagination from "../components/Pagination";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const IssueListPage = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState(null);
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [issuesPerPage] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const [openEndIssueDialog, setOpenEndIssueDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [issueDescription, setIssueDescription] = useState("");
  const [remediation, setRemediation] = useState("");
  const [responsiblePerson, setResponsiblePerson] = useState("");
  const [endTime, setEndTime] = useState("");
  const [downtimeMinutes, setDowntimeMinutes] = useState(0);

  useEffect(() => {
    fetchIssuesData();
  }, []);

  const fetchIssuesData = async () => {
    setLoading(true);
    try {
      const data = await fetchIssues();
      if (Array.isArray(data)) {
        setIssues(data.filter((issue) => !issue.endTime));
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
    let filtered = issues;

    if (searchTerm) {
      filtered = filtered.filter(
        (issue) =>
          issue.lineNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(issue.stationNumber)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          issue.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.issue.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [issues, searchTerm, filterDate]);

  useEffect(() => {
    filterIssues();
  }, [issues, searchTerm, filterDate, filterIssues]);

  const handleEndIssue = (issue) => {
    const currentTime = new Date();
    const formattedEndTime = format(currentTime, "HH:mm MM/dd/yyyy", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
    const startTime = parse(
      issue.submissionTime,
      "HH:mm MM/dd/yyyy",
      new Date()
    );
    const minutesDifference = differenceInMinutes(currentTime, startTime);

    setSelectedIssue(issue);
    setEndTime(formattedEndTime);
    setDowntimeMinutes(minutesDifference);
    setOpenEndIssueDialog(true);
  };

  const handleCloseEndIssueDialog = () => {
    setOpenEndIssueDialog(false);
    setSelectedIssue(null);
    setIssueDescription("");
    setRemediation("");
    setResponsiblePerson("");
    setEndTime("");
    setDowntimeMinutes(0);
  };

  const handleConfirmEndIssue = async () => {
    setIsLoading(true);
    try {
      const result = await endIssue(selectedIssue.id, endTime, {
        issue: issueDescription,
        remediation,
        responsiblePerson,
        downtimeMinutes,
      });

      if (result.status === "success") {
        setIssues(issues.filter((i) => i.id !== selectedIssue.id));
        setShowSuccess(true);
        handleCloseEndIssueDialog();
        setTimeout(() => {
          setShowSuccess(false);
          setIsLoading(false);
        }, 2000);
      } else {
        throw new Error(result.message || "Failed to update end time");
      }
    } catch (error) {
      console.error("Error ending issue:", error);
      setIsLoading(false);
    }
  };

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
          DANH SÁCH VẤN ĐỀ DOWNTIME
        </Typography>
        {loading ? (
          <LoadingAnimation />
        ) : (
          <>
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
                  handleEndIssue={handleEndIssue}
                />
              </Box>
            </Fade>
          </>
        )}
      </Container>

      <Dialog open={openEndIssueDialog} onClose={handleCloseEndIssueDialog}>
        <DialogTitle textAlign={"center"}>
          KẾT THÚC THỜI GIAN DOWNTIME
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Thời gian kết thúc"
            type="text"
            fullWidth
            variant="outlined"
            value={endTime}
            InputProps={{
              readOnly: true,
            }}
          />
          <TextField
            margin="dense"
            label="Số phút downtime"
            type="number"
            fullWidth
            variant="outlined"
            value={downtimeMinutes}
            InputProps={{
              readOnly: true,
            }}
          />
          <TextField
            autoFocus
            margin="dense"
            label="Mô tả vấn đề"
            type="text"
            fullWidth
            variant="outlined"
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Phương án giải quyết"
            type="text"
            fullWidth
            variant="outlined"
            value={remediation}
            onChange={(e) => setRemediation(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Người giải quyết vấn đề"
            type="text"
            fullWidth
            variant="outlined"
            value={responsiblePerson}
            onChange={(e) => setResponsiblePerson(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          {/* <Button onClick={handleCloseEndIssueDialog}>Hủy</Button> */}
          <Button onClick={handleConfirmEndIssue} fullWidth variant="contained">
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {(isLoading || showSuccess) && <div className="overlay" />}

      <Dialog
        open={isLoading && !showSuccess}
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
        open={showSuccess}
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
          <DialogContentText style={{ fontSize: "1.2rem" }}>
            Ghi nhận dữ liệu thành công!
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IssueListPage;
