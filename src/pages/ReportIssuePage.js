// src/pages/ReportIssuePage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  TextField,
  Typography,
  Autocomplete,
  Grid,
  Chip,
} from "@mui/material";
import { useFormContext } from "../context/FormContext";
import Header from "../components/Header";
import AutofillPreventer from "../components/AutofillPreventer";

const ReportIssuePage = () => {
  const { formData, updateFormData } = useFormContext();
  const navigate = useNavigate();
  const [selectedStations, setSelectedStations] = useState([]);
  const [stationInput, setStationInput] = useState({ value: "", error: "" });

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
    { value: "KT", label: "KỸ THUẬT" },
    { value: "DG", label: "ĐÓNG GÓI" },
  ];

  const scopes = [
    { value: "Máy móc", label: "Máy móc" },
    { value: "Con người", label: "Con người" },
    { value: "Nguyên phụ liệu", label: "Nguyên phụ liệu" },
    { value: "Phương pháp", label: "Phương pháp" },
    // { value: "Khác", label: "Khác" },
  ];

  const handleScopeSelection = (selectedScope) => {
    updateFormData({ scope: selectedScope, stationNumbers: selectedStations });
    if (!formData.lineNumber || selectedStations.length === 0) return;

    switch (selectedScope) {
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

  const handleStationAdd = (event, newValue) => {
    if (newValue) {
      if (!selectedStations.includes(newValue.label)) {
        setSelectedStations([...selectedStations, newValue.label]);
        setStationInput({ value: "", error: "" });
      } else {
        setStationInput({
          value: newValue.label,
          error: `ĐÃ NHẬP TRẠM ${newValue.label} RỒI!`,
        });
      }
    }
  };

  const handleStationDelete = (stationToDelete) => () => {
    setSelectedStations(
      selectedStations.filter((station) => station !== stationToDelete)
    );
  };

  return (
    <>
      <Header />
      <Container maxWidth="sm">
        <Typography variant="h5" gutterBottom>
          GHI NHẬN VẤN ĐỀ DOWNTIME
        </Typography>
        <form onSubmit={(e) => e.preventDefault()} autoComplete="off">
          <AutofillPreventer />
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
                  autoComplete: "new-password",
                  form: {
                    autoComplete: "off",
                  },
                }}
              />
            )}
          />
          <Autocomplete
            options={stationNumbers}
            getOptionLabel={(option) => option.label}
            onChange={handleStationAdd}
            value={stationInput.value ? { label: stationInput.value } : null}
            inputValue={stationInput.value}
            onInputChange={(event, newInputValue) => {
              setStationInput({ value: newInputValue, error: "" });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Nhập số trạm"
                variant="outlined"
                fullWidth
                margin="normal"
                error={!!stationInput.error}
                helperText={stationInput.error}
                InputProps={{
                  ...params.InputProps,
                  autoComplete: "new-password",
                  form: {
                    autoComplete: "off",
                  },
                }}
              />
            )}
          />
          <div style={{ marginTop: 10, marginBottom: 10 }}>
            {selectedStations.map((station) => (
              <Chip
                key={station}
                label={station}
                onDelete={handleStationDelete(station)}
                style={{ margin: 2 }}
              />
            ))}
          </div>
          <Typography
            variant="subtitle1"
            gutterBottom
            style={{ marginTop: "20px" }}
          >
            Chọn phạm vi vấn đề:
          </Typography>
          <Grid container spacing={2}>
            {scopes.map((scope) => (
              <Grid item xs={6} key={scope.value}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleScopeSelection(scope.value)}
                  disabled={
                    !formData.lineNumber || selectedStations.length === 0
                  }
                >
                  {scope.label}
                </Button>
              </Grid>
            ))}
          </Grid>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={() => navigate(-1)}
            style={{ marginTop: "20px" }}
          >
            Back
          </Button>
        </form>
      </Container>
    </>
  );
};

export default ReportIssuePage;
