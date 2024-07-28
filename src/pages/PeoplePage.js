// src/pages/PeoplePage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Typography,
  Button,
  Autocomplete,
  InputAdornment,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useFormContext } from "../context/FormContext";
import issueOptions from "../data/issueOptions";
import Header from "../components/Header";

const PeoplePage = () => {
  const { formData, updateFormData } = useFormContext();
  const navigate = useNavigate();

  const isFormValid = () => {
    if (formData.issue === "Khác") return formData.otherIssue.trim() !== "";
    return !!formData.issue;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    navigate("/remediation");
  };

  return (
    <>
      <Header />
      <Container maxWidth="sm">
        <Typography variant="h5" gutterBottom>
          VẤN ĐỀ LIÊN QUAN ĐẾN CON NGƯỜI
        </Typography>
        <form onSubmit={handleSubmit}>
          <Autocomplete
            value={formData.issue}
            options={issueOptions.people}
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

export default PeoplePage;
