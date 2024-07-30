// src/pages/IssueListPage.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  CircularProgress,
  Box,
  Fade,
} from "@mui/material";
import Header from "../components/Header";
import IssueFilters from "../components/IssueFilters";
import IssueDetails from "../components/IssueDetails";
import { useNavigate } from "react-router-dom";
import { format, parse, isValid } from "date-fns";
import LoadingAnimation from "../components/LoadingAnimation";
import { Snackbar, Alert } from "@mui/material";

const IssueListPage = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState(null);
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingEnd, setLoadingEnd] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxyZSwPl9UHgE2MLhz6dH8kQvVHbswJq-wlNFrtjcto7yuKTj3hbAPAgvah9CNuPGGTiA/exec"
      );
      const data = await response.json();
      setIssues(data.filter((issue) => !issue.endTime));
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
          issue.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.issue.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterDate) {
      const formattedFilterDate = format(filterDate, "dd/MM/yyyy");
      filtered = filtered.filter((issue) => {
        const issueDate = parse(
          issue.submissionTime,
          "HH:mm dd/MM/yyyy",
          new Date()
        );
        return (
          isValid(issueDate) &&
          format(issueDate, "dd/MM/yyyy") === formattedFilterDate
        );
      });
    }

    setFilteredIssues(filtered);
  }, [issues, searchTerm, filterDate]);

  useEffect(() => {
    filterIssues();
  }, [issues, searchTerm, filterDate, filterIssues]);

  const handleEndIssue = (issue) => {
    setSelectedIssue(issue);
    setOpenDialog(true);
  };

  const confirmEndIssue = async () => {
    setLoadingEnd(true);
    try {
      const endTime = new Date().toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxyZSwPl9UHgE2MLhz6dH8kQvVHbswJq-wlNFrtjcto7yuKTj3hbAPAgvah9CNuPGGTiA/exec",
        {
          method: "POST",
          body: JSON.stringify({
            action: "endIssue",
            id: selectedIssue.id,
            endTime,
            calculateDowntime: true, // Thêm flag này để yêu cầu tính toán thời gian downtime
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.status === "success") {
          setIssues(issues.filter((issue) => issue.id !== selectedIssue.id));
          setOpenDialog(false);
          setSnackbar({
            open: true,
            message: "Cập nhật thành công!",
            severity: "success",
          });
          setTimeout(() => {
            setSnackbar((prevState) => ({ ...prevState, open: false }));
          }, 3000);
        } else {
          throw new Error(result.message || "Failed to update end time");
        }
      } else {
        throw new Error("Failed to update end time");
      }
    } catch (error) {
      console.error("Error ending issue:", error);
      setSnackbar({
        open: true,
        message: "Cập nhật thất bại!",
        severity: "error",
      });
      setTimeout(() => {
        setSnackbar((prevState) => ({ ...prevState, open: false }));
      }, 3000);
    } finally {
      setLoadingEnd(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleExpand = (id) => {
    setExpandedIssue(expandedIssue === id ? null : id);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Header />
      <Container maxWidth="md">
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
            <Fade in={!loading} timeout={1000}>
              <Box>
                <IssueDetails
                  filteredIssues={filteredIssues}
                  expandedIssue={expandedIssue}
                  handleExpand={handleExpand}
                  handleEndIssue={handleEndIssue}
                />
              </Box>
            </Fade>
          </>
        )}
      </Container>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        disableBackdropClick={loadingEnd}
        disableEscapeKeyDown={loadingEnd}
      >
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn kết thúc vấn đề này?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={loadingEnd}>
            Hủy
          </Button>
          <Button
            onClick={confirmEndIssue}
            color="primary"
            disabled={loadingEnd}
          >
            {loadingEnd ? <CircularProgress size={24} /> : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default IssueListPage;
