// src/pages/MachineryRemediationPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useFormContext } from "../context/FormContext";
import machineryRemediationOptions from "../data/machineryRemediationOptions";

const MachineryRemediationPage = () => {
  const { formData, updateFormData } = useFormContext();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.remediation ||
      (formData.remediation === "Khác" && !formData.otherRemediation)
    )
      return;
    navigate("/responsibleperson");
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom>
        HÀNH ĐỘNG KHẮC PHỤC
      </Typography>
      <form onSubmit={handleSubmit}>
        <FormControl component="fieldset" fullWidth margin="normal">
          <RadioGroup
            aria-label="remediation"
            name="remediation"
            value={formData.remediation}
            onChange={(e) => updateFormData({ remediation: e.target.value })}
          >
            {machineryRemediationOptions.map((option) => (
              <FormControlLabel
                key={option}
                value={option}
                control={<Radio />}
                label={option}
              />
            ))}
          </RadioGroup>
        </FormControl>
        {formData.remediation === "Khác" && (
          <TextField
            label="Nhập hành động khắc phục khác"
            value={formData.otherRemediation}
            onChange={(e) =>
              updateFormData({ otherRemediation: e.target.value })
            }
            variant="outlined"
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: formData.otherRemediation && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear input"
                    onClick={() => updateFormData({ otherRemediation: "" })}
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
          disabled={
            !formData.remediation ||
            (formData.remediation === "Khác" && !formData.otherRemediation)
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
  );
};

export default MachineryRemediationPage;
