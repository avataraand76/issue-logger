// src/pages/ReportIssuePage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  TextField,
  Typography,
  Autocomplete,
  MenuItem,
} from "@mui/material";
import { useFormContext } from "../context/FormContext";
import Header from "../components/Header";

const ReportIssuePage = () => {
  const { formData, updateFormData } = useFormContext();
  const navigate = useNavigate();

  // Danh sách các số chuyền và nhãn của chúng
  const lineNumbers = Array.from({ length: 40 }, (_, i) => ({
    value: i + 1,
    label: i + 1 === 14 ? "Line 20.01" : `Line ${i + 1}`,
  }));

  const scopes = [
    { value: "Máy móc", label: "Máy móc" },
    { value: "Con người", label: "Con người" },
    { value: "Nguyên phụ liệu", label: "Nguyên phụ liệu" },
    { value: "Phương pháp", label: "Phương pháp" },
    // { value: "Khác", label: "Khác" },
  ];

  const handleNext = () => {
    if (!formData.lineNumber || !formData.scope) return;
    switch (formData.scope) {
      case "Máy móc":
        navigate("/machinery");
        break;
      case "Con người":
        navigate("/people");
        break;
      case "Nguyên phụ liệu":
        navigate("/materials");
        break;
      case "Phương pháp":
        navigate("/method");
        break;
      // case "Khác":
      //   navigate("/other");
      //   break;
      default:
        break;
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="sm">
        <Typography variant="h5" gutterBottom>
          GHI NHẬN VẤN ĐỀ DOWNTIME
        </Typography>
        <Autocomplete
          options={lineNumbers}
          getOptionLabel={(option) => option.label}
          onChange={(event, newValue) => {
            updateFormData({ lineNumber: newValue ? newValue.label : "" });
          }}
          value={
            lineNumbers.find((ln) => ln.label === formData.lineNumber) || null
          }
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
          value={formData.scope}
          onChange={(e) => updateFormData({ scope: e.target.value })}
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
          disabled={!formData.lineNumber || !formData.scope}
        >
          Next
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          onClick={() => navigate(-1)}
          style={{ marginTop: "10px" }}
        >
          Back
        </Button>
      </Container>
    </>
  );
};

export default ReportIssuePage;
