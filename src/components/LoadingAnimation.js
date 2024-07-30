// src/components/LoadingAnimation.js
import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingAnimation = () => (
  <Box display="flex" flexDirection="column" alignItems="center" my={4}>
    <CircularProgress size={60} />
    <Typography variant="h6" style={{ marginTop: 16 }}>
      Đang tải dữ liệu...
    </Typography>
  </Box>
);

export default LoadingAnimation;
