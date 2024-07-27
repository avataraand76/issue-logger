// src/components/Header.js
import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { styled } from "@mui/system";
import logo from "../assets/logo2.png";

const CustomAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "white",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  borderRadius: "20px",
  padding: "0 16px",
  width: "100%",
  position: "relative",
}));

const Header = () => {
  return (
    <CustomAppBar position="static">
      <Toolbar>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="100%"
        >
          <img
            src={logo}
            alt="Company Logo"
            style={{ marginRight: "16px", height: "40px" }}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{ color: "black", textAlign: "center", fontWeight: " bold" }}
          >
            CÔNG TY TNHH MAY VIỆT LONG HƯNG
          </Typography>
        </Box>
      </Toolbar>
    </CustomAppBar>
  );
};

export default Header;
