// src/pages/HomePage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button, Box } from "@mui/material";
import { styled } from "@mui/system";
import Header from "../components/Header";

const AnimatedButton = styled(Button)(({ theme }) => ({
  padding: "20px 0",
  fontSize: "1.2rem",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
  },
}));

const HomePage = () => {
  const navigate = useNavigate();

  const handleReportIssue = () => {
    navigate("/report-issue");
  };

  const handleIssueList = () => {
    navigate("/issue-list");
  };

  return (
    <>
      <Header />
      <Container maxWidth="sm">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <AnimatedButton
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleReportIssue}
            sx={{ mb: 3 }}
          >
            GHI NHẬN VẤN ĐỀ DOWNTIME
          </AnimatedButton>
          <AnimatedButton
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleIssueList}
          >
            DANH SÁCH VẤN ĐỀ DOWNTIME
          </AnimatedButton>
        </Box>
      </Container>
    </>
  );
};

export default HomePage;
