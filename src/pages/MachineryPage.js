// src/pages/MachineryPage.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Typography,
  Button,
  MenuItem,
  Autocomplete,
  InputAdornment,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useFormContext } from "../context/FormContext";
import machineryCodes from "../data/machineryCodes";
import issueOptions from "../data/issueOptions";
import Header from "../components/Header";

const MachineryPage = () => {
  const { formData, updateFormData } = useFormContext();
  const navigate = useNavigate();

  const isFormValid = () => {
    if (!formData.machineryType || !formData.code) return false;
    if (formData.issue === "Khác") return formData.otherIssue.trim() !== "";
    return !!formData.issue;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    navigate("/machineryremediation");
  };

  useEffect(() => {
    // Reset code when machineryType changes
    updateFormData({ code: null });
  }, [formData.machineryType, updateFormData]);

  return (
    <>
      <Header />
      <Container maxWidth="sm">
        <Typography variant="h5" gutterBottom>
          VẤN ĐỀ LIÊN QUAN ĐẾN MÁY MÓC
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            select
            label="Chọn loại thiết bị"
            value={formData.machineryType}
            onChange={(e) => updateFormData({ machineryType: e.target.value })}
            variant="outlined"
            fullWidth
            margin="normal"
          >
            <MenuItem value="Thiết bị may">Thiết bị may</MenuItem>
            <MenuItem value="Thiết bị chuyên dùng">
              Thiết bị chuyên dùng
            </MenuItem>
            <MenuItem value="Công cụ thiết bị">Công cụ thiết bị</MenuItem>
          </TextField>
          {formData.machineryType && (
            <Autocomplete
              value={formData.code}
              options={machineryCodes[formData.machineryType] || []}
              getOptionLabel={(option) => `${option.value} - ${option.label}`}
              onChange={(e, newValue) => updateFormData({ code: newValue })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Mã thiết bị"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>{`${option.value} - ${option.label}`}</li>
              )}
              clearIcon={<CloseIcon fontSize="small" />}
            />
          )}
          <Autocomplete
            value={formData.issue}
            options={issueOptions}
            onChange={(e, newValue) => {
              updateFormData({ issue: newValue });
              if (newValue !== "Khác") updateFormData({ otherIssue: "" });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Vấn đề"
                variant="outlined"
                margin="normal"
                fullWidth
              />
            )}
            clearIcon={<CloseIcon fontSize="small" />}
          />
          {formData.issue === "Khác" && (
            <TextField
              label="Nhập vấn đề khác"
              value={formData.otherIssue}
              onChange={(e) => updateFormData({ otherIssue: e.target.value })}
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{
                endAdornment: formData.otherIssue && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear input"
                      onClick={() => updateFormData({ otherIssue: "" })}
                      edge="end"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={!isFormValid()}
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

export default MachineryPage;
