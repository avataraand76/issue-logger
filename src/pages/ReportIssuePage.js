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
  const lineNumbers = [
    ...Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: `Line ${i + 1}`,
    })),
    { value: 20.01, label: "Line 20.01" },
    ...Array.from({ length: 26 }, (_, i) => ({
      value: i + 15,
      label: `Line ${i + 15}`,
    })),
    { value: 41, label: "Tổ hoàn thành 1 - xưởng 4" },
    { value: 42, label: "Tổ hoàn thành 2 - xưởng 4" },
  ];

  const stationNumbers = [
    ...Array.from({ length: 80 }, (_, i) => ({
      value: i + 1,
      label: `${i + 1}`,
    })),
    { value: "QC", label: "QC" },
    { value: "DG", label: "Đóng gói" },
  ];

  const scopes = [
    { value: "Máy móc", label: "Máy móc" },
    { value: "Con người", label: "Con người" },
    { value: "Nguyên phụ liệu", label: "Nguyên phụ liệu" },
    { value: "Phương pháp", label: "Phương pháp" },
    // { value: "Khác", label: "Khác" },
  ];

  const handleNext = () => {
    if (!formData.lineNumber || !formData.scope || !formData.stationNumber)
      return;
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
        <form onSubmit={(e) => e.preventDefault()} autocomplete="off">
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
                InputProps={{
                  ...params.InputProps,
                  autocomplete: "new-password",
                  form: {
                    autocomplete: "off",
                  },
                }}
              />
            )}
          />
          <Autocomplete
            options={stationNumbers}
            getOptionLabel={(option) => option.label}
            onChange={(event, newValue) => {
              updateFormData({ stationNumber: newValue ? newValue.label : "" });
            }}
            value={
              stationNumbers.find(
                (sn) => sn.label === formData.stationNumber
              ) || null
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Nhập số trạm"
                variant="outlined"
                fullWidth
                margin="normal"
                InputProps={{
                  ...params.InputProps,
                  autocomplete: "new-password",
                  form: {
                    autocomplete: "off",
                  },
                }}
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
            InputProps={{
              autocomplete: "new-password",
              form: {
                autocomplete: "off",
              },
            }}
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
            disabled={
              !formData.lineNumber || !formData.scope || !formData.stationNumber
            }
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
        </form>
      </Container>
    </>
  );
};

export default ReportIssuePage;
