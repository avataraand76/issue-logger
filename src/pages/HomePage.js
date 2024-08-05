import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button, Box } from "@mui/material";
import { styled } from "@mui/system";
import Header from "../components/Header";
import LeftIssuesNotification from "../components/LeftIssuesNotification";
import { fetchIssues } from "../data/api";

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
  const [leftIssuesCount, setLeftIssuesCount] = useState(0);

  useEffect(() => {
    const fetchLeftIssuesCount = async () => {
      try {
        const issues = await fetchIssues();
        const leftIssues = issues.filter((issue) => !issue.endTime);
        setLeftIssuesCount(leftIssues.length);

        if (leftIssues.length !== leftIssuesCount) {
          await sendNotification(leftIssues.length);
        }
      } catch (error) {
        console.error("Error fetching left issues:", error);
      }
    };

    fetchLeftIssuesCount();

    const intervalId = setInterval(fetchLeftIssuesCount, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, [leftIssuesCount]);

  const handleReportIssue = () => {
    navigate("/report-issue");
  };

  const handleIssueList = () => {
    navigate("/issue-list");
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      try {
        const permission = await Notification.requestPermission();
        console.log("Notification permission:", permission);
        return permission;
      } catch (error) {
        console.error("Error requesting notification permission:", error);
        return "denied";
      }
    }
    return "unsupported";
  };

  const sendNotification = async (count) => {
    const permission = await requestNotificationPermission();
    if (permission === "granted") {
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification("Issue Update", {
            body: `Có ${count} vấn đề downtime chưa được xử lý!`,
            icon: "logo192.png",
            badge: "logo192.png",
          });
        } catch (error) {
          console.error("Error showing notification:", error);
        }
      }
    }
  };

  const sendTestNotification = async () => {
    const permission = await requestNotificationPermission();
    if (permission === "granted") {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification("Test Notification", {
            body: "This is a test notification",
            icon: "logo192.png",
            badge: "logo192.png",
          });
        } catch (error) {
          console.error("Error showing notification:", error);
        }
      }
    } else {
      console.log("Notification permission not granted");
      // Optionally, inform the user that they need to grant permission
      alert("Please grant notification permission to receive updates.");
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <Box display="flex" flexDirection="column" height="100vh" overflow="hidden">
      <Header />
      <Container
        maxWidth="sm"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          py: 2,
          paddingBottom: "300px",
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
            sx={{ mb: 3 }}
          >
            DANH SÁCH VẤN ĐỀ DOWNTIME
          </AnimatedButton>
          <AnimatedButton
            variant="contained"
            color="info"
            fullWidth
            onClick={sendTestNotification}
            sx={{ mb: 3 }}
          >
            GỬI THÔNG BÁO TEST
          </AnimatedButton>
          <Box height="60.8px">
            <LeftIssuesNotification leftIssuesCount={leftIssuesCount} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
