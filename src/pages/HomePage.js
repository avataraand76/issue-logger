// src/pages/HomePage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button, Box } from "@mui/material";
import { styled } from "@mui/system";
import Header from "../components/Header";

const AnimatedButton = styled(Button)(({ theme }) => ({
  padding: "15px 0",
  fontSize: "1.1rem",
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
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      overflow="hidden"
      sx={{
        "& > :first-of-type": {
          flexShrink: 0,
        },
      }}
    >
      <Header />
      <Container
        maxWidth="sm"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          py: 2, // Add padding top and bottom
        }}
      >
        <Box>
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
    </Box>
  );
};

export default HomePage;
