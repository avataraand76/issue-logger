// src/pages/HomePage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  TextField,
  Autocomplete,
  MenuItem,
} from "@mui/material";

const HomePage = () => {
  const [lineNumber, setLineNumber] = useState(null);
  const [scope, setScope] = useState("");
  const navigate = useNavigate();

  // Danh sách các số chuyền và nhãn của chúng
  const lineNumbers = Array.from({ length: 40 }, (_, i) => ({
    value: i + 1,
    label: i + 1 === 14 ? "Line 20.01" : `Line ${i + 1}`,
  }));

  const scopes = [
    { value: "machinery", label: "Máy móc" },
    { value: "people", label: "Con người" },
    { value: "materials", label: "Nguyên phụ liệu" },
    { value: "method", label: "Phương pháp" },
    { value: "other", label: "Khác" },
  ];

  const handleNext = () => {
    if (!lineNumber || !scope) return;
    switch (scope) {
      case "machinery":
        navigate("/machinery");
        break;
      case "people":
        navigate("/people");
        break;
      case "materials":
        navigate("/materials");
        break;
      case "method":
        navigate("/method");
        break;
      case "other":
        navigate("/other");
        break;
      default:
        break;
    }
  };

  return (
    <Container maxWidth="sm">
      <Autocomplete
        options={lineNumbers}
        getOptionLabel={(option) => option.label}
        onChange={(event, newValue) => {
          setLineNumber(newValue);
        }}
        value={lineNumber}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Nhập số chuyền"
            variant="outlined"
            fullWidth
            margin="normal"
          />
        )}
      />
      <TextField
        select
        label="Phạm vi vấn đề"
        value={scope}
        onChange={(e) => setScope(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
      >
        {scopes.map((scopeOption) => (
          <MenuItem key={scopeOption.value} value={scopeOption.value}>
            {scopeOption.label}
          </MenuItem>
        ))}
      </TextField>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleNext}
        disabled={!lineNumber || !scope}
      >
        Next
      </Button>
    </Container>
  );
};

export default HomePage;
