// src/pages/IssueListPage.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

const IssueListPage = () => {
  const [issues, setIssues] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbyrB4N-uLjwzfA-VKx5W8Lyc9aKCzaOV2zzrTudywl5g-8hNGj2Be8I2y_szMFwrmiziQ/exec"
      );
      const data = await response.json();
      setIssues(data);
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };

  const handleEndIssue = async (issue) => {
    setSelectedIssue(issue);
    setOpenDialog(true);
  };

  const confirmEndIssue = async () => {
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
        "https://script.google.com/macros/s/AKfycbyrB4N-uLjwzfA-VKx5W8Lyc9aKCzaOV2zzrTudywl5g-8hNGj2Be8I2y_szMFwrmiziQ/exec",
        {
          method: "POST",
          body: JSON.stringify({
            action: "endIssue",
            id: selectedIssue.id,
            endTime,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.status === "success") {
          // Remove the ended issue from the local state
          setIssues(issues.filter((issue) => issue.id !== selectedIssue.id));
          setOpenDialog(false);
        } else {
          throw new Error(result.message || "Failed to update end time");
        }
      } else {
        throw new Error("Failed to update end time");
      }
    } catch (error) {
      console.error("Error ending issue:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
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
        <Grid container spacing={3}>
          {issues.map((issue) => (
            <Grid item xs={12} sm={6} md={4} key={issue.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{issue.lineNumber}</Typography>
                  <Typography>Phạm vi: {issue.scope}</Typography>
                  <Typography>Vấn đề: {issue.issue}</Typography>
                  <Typography>
                    Thời gian bắt đầu: {issue.submissionTime}
                  </Typography>
                  <Typography>
                    Thời gian kết thúc: {issue.endTime || "Chưa kết thúc"}
                  </Typography>
                  {!issue.endTime && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleEndIssue(issue)}
                    >
                      KẾT THÚC THỜI GIAN DOWNTIME
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn kết thúc vấn đề này?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button onClick={confirmEndIssue} color="primary">
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default IssueListPage;
