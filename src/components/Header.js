// src/components/Header.js
import React from "react";
import { AppBar, Toolbar, Typography, Box, Container } from "@mui/material";
import { styled } from "@mui/system";
import logo from "../assets/logo2.png";

const CustomAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "white",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  borderRadius: "20px",
  padding: "0 16px",
  position: "relative",
  marginBottom: "30px",
}));

const Header = () => {
  return (
    <CustomAppBar position="static">
      <Container maxWidth="md">
        <Toolbar disableGutters>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
          >
            <img
              src={logo}
              alt="Company Logo"
              style={{ marginRight: "16px", height: "50px" }}
            />
            <Typography
              variant="subtitle1"
              component="div"
              sx={{
                color: "black",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "1.2rem",
              }}
            >
              CÔNG TY TNHH MAY VIỆT LONG HƯNG
            </Typography>
          </Box>
        </Toolbar>
      </Container>
    </CustomAppBar>
  );
};

export default Header;
