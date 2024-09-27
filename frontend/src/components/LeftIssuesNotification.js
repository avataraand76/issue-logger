// frontend/src/components/LeftIssuesNotification.js
import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import { styled } from "@mui/system";
import WarningIcon from "@mui/icons-material/Warning";

const slideIn = keyframes`
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(-100%);
  }
`;

const zoomIn = keyframes`
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const zoomOut = keyframes`
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0);
    opacity: 0;
  }
`;

const NotificationBanner = styled(Box)(({ shouldZoomOut }) => ({
  backgroundColor: "#ffa000",
  color: "#ffffff",
  padding: "8px",
  overflow: "hidden",
  width: "100%",
  height: "60.8px",
  display: "flex",
  alignItems: "center",
  boxSizing: "border-box",
  borderRadius: "25px",
  animation: shouldZoomOut
    ? `${zoomOut} 0.5s ease-out forwards`
    : `${zoomIn} 0.5s ease-out`,
}));

const AnimatedText = styled(Typography)({
  display: "inline-block",
  whiteSpace: "nowrap",
  animation: `${slideIn} 10s linear infinite`,
  textTransform: "uppercase",
  fontSize: "30px",
  marginLeft: "8px",
});

const LeftIssuesNotification = ({ leftIssuesCount }) => {
  const [shouldZoomOut, setShouldZoomOut] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [prevLeftIssuesCount, setPrevLeftIssuesCount] = useState(null);

  useEffect(() => {
    if (prevLeftIssuesCount !== null) {
      if (leftIssuesCount === 0 && prevLeftIssuesCount > 0) {
        setShouldZoomOut(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 500);
      } else if (leftIssuesCount > 0) {
        setShouldZoomOut(false);
        setIsVisible(true);
      }
    } else if (leftIssuesCount > 0) {
      setIsVisible(true);
    }

    setPrevLeftIssuesCount(leftIssuesCount);
  }, [leftIssuesCount, prevLeftIssuesCount]);

  if (!isVisible) return null;

  return (
    <NotificationBanner shouldZoomOut={shouldZoomOut}>
      <WarningIcon />
      <AnimatedText variant="body1">
        {`Có ${leftIssuesCount} vấn đề downtime chưa được xử lý !!!`}
      </AnimatedText>
    </NotificationBanner>
  );
};

export default LeftIssuesNotification;
