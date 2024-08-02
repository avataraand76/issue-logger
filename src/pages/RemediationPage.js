// src/pages/RemediationPage.js
import React, { useState, useMemo, useEffect } from "react";
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
  Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useFormContext } from "../context/FormContext";
import remediationOptions from "../data/remediationOptions";
import Header from "../components/Header";
import AutofillPreventer from "../components/AutofillPreventer";
import peopleList from "../data/peopleList";

const RemediationPage = () => {
  const { formData, updateFormData } = useFormContext();
  const navigate = useNavigate();

  const options = useMemo(() => {
    return remediationOptions[formData.scope] || [];
  }, [formData.scope]);

  const [filteredPeopleList, setFilteredPeopleList] = useState([]);

  useEffect(() => {
    filterPeopleList(formData.lineNumber);
  }, [formData.lineNumber]);

  const filterPeopleList = (lineNumber) => {
    if (!lineNumber) {
      setFilteredPeopleList([]);
      return;
    }

    let filteredList = [];
    let workshopList = [];

    if (lineNumber === "Line 20.01") {
      const teamLeaders = peopleList.teamLeaders.filter((person) =>
        person.includes("TỔ TRƯỞNG TỔ 20.01")
      );
      workshopList = peopleList.workshop2;
      filteredList = [...teamLeaders, ...workshopList];
    } else if (lineNumber === "Line 20") {
      const teamLeaders = peopleList.teamLeaders.filter((person) =>
        person.includes("TỔ TRƯỞNG TỔ 20 -")
      );
      workshopList = peopleList.workshop2;
      filteredList = [...teamLeaders, ...workshopList];
    } else {
      const lineNum = parseInt(lineNumber.replace("Line ", ""));

      if (lineNum >= 1 && lineNum <= 10) {
        workshopList = peopleList.workshop1;
      } else if (lineNum >= 11 && lineNum <= 20) {
        workshopList = peopleList.workshop2;
      } else if (lineNum >= 21 && lineNum <= 30) {
        workshopList = peopleList.workshop3;
      } else if (
        (lineNum >= 31 && lineNum <= 40) ||
        lineNumber === "Tổ hoàn thành 1 - xưởng 4" ||
        lineNumber === "Tổ hoàn thành 2 - xưởng 4"
      ) {
        workshopList = peopleList.workshop4;
      }

      const teamLeaders = peopleList.teamLeaders.filter(
        (person) =>
          person.includes(
            `TỔ TRƯỞNG TỔ ${lineNum.toString().padStart(2, "0")}`
          ) ||
          (lineNumber === "Tổ hoàn thành 1 - xưởng 4" &&
            person.includes("TỔ TRƯỞNG TỔ HOÀN THÀNH 1")) ||
          (lineNumber === "Tổ hoàn thành 2 - xưởng 4" &&
            person.includes("TỔ TRƯỞNG TỔ HOÀN THÀNH 2"))
      );

      filteredList = [...teamLeaders, ...workshopList];
    }

    setFilteredPeopleList(filteredList);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.remediation ||
      (formData.remediation === "Khác" && !formData.otherRemediation) ||
      !formData.problemSolver
    )
      return;
    navigate("/responsibleperson");
  };

  return (
    <>
      <Header />
      <Container maxWidth="sm">
        <Typography variant="h5" gutterBottom>
          HÀNH ĐỘNG KHẮC PHỤC
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Phạm vi: {formData.scope}
        </Typography>
        <form onSubmit={handleSubmit} autoComplete="off">
          <AutofillPreventer />
          <FormControl component="fieldset" fullWidth margin="normal">
            <RadioGroup
              aria-label="remediation"
              name="remediation"
              value={formData.remediation}
              onChange={(e) => updateFormData({ remediation: e.target.value })}
            >
              {options.map((option) => (
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
                autoComplete: "new-password",
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
          <Autocomplete
            options={filteredPeopleList}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Chọn người giải quyết vấn đề"
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
            value={formData.problemSolver}
            onChange={(event, newValue) => {
              updateFormData({ problemSolver: newValue });
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={
              !formData.remediation ||
              (formData.remediation === "Khác" && !formData.otherRemediation) ||
              !formData.problemSolver
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

export default RemediationPage;
