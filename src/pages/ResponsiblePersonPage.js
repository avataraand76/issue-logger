// src/pages/ResponsiblePersonPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  Typography,
  Autocomplete,
  TextField,
  Dialog,
  DialogContent,
  DialogContentText,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useFormContext } from "../context/FormContext";
import peopleList from "../data/peopleList";
import Header from "../components/Header";
import { addIssue } from "../data/api";
import AutofillPreventer from "../components/AutofillPreventer";
import { format } from "date-fns";

const ResponsiblePersonPage = () => {
  const { formData, updateFormData, resetFormData } = useFormContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredPeopleList, setFilteredPeopleList] = useState([]);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const timestamp = format(new Date(), "HH:mm MM/dd/yyyy", {
      timeZone: "Asia/Ho_Chi_Minh",
    });

    const baseData = {
      action: "addIssue",
      submissionTime: timestamp,
      lineNumber: formData.lineNumber,
      scope: formData.scope,
      issue:
        formData.issue === "Khác"
          ? `Khác - ${formData.otherIssue}`
          : formData.issue,
      remediation:
        formData.remediation === "Khác"
          ? `Khác - ${formData.otherRemediation}`
          : formData.remediation,
      problemSolver: formData.problemSolver,
      responsiblePerson: formData.responsiblePerson,
    };

    if (formData.scope === "Máy móc") {
      baseData.machineryType = formData.machineryType;
      baseData.code = formData.code
        ? `${formData.code.value} - ${formData.code.label}`
        : "";
    }

    try {
      for (const stationNumber of formData.stationNumbers) {
        const data = { ...baseData, stationNumber };
        const result = await addIssue(data);
        if (result.status !== "success") {
          throw new Error(result.message || "Failed to save data");
        }
      }
      setIsLoading(false);
      setOpenDialog(true);
      setTimeout(() => {
        handleCloseDialog();
      }, 2000);
    } catch (error) {
      console.error("Error saving data:", error);
      setIsLoading(false);
      // Handle error here
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetFormData();
    navigate("/");
  };

  return (
    <>
      <Header />
      <Container maxWidth="sm">
        <Typography variant="h5" gutterBottom>
          NGƯỜI GHI NHẬN VẤN ĐỀ
        </Typography>
        <form onSubmit={handleSubmit} autoComplete="off">
          <AutofillPreventer />
          <Autocomplete
            options={filteredPeopleList}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Chọn người ghi nhận vấn đề"
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
            value={formData.responsiblePerson}
            onChange={(event, newValue) => {
              updateFormData({ responsiblePerson: newValue });
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={!formData.responsiblePerson || isLoading}
          >
            Xác nhận
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={() => navigate(-1)}
            style={{ marginTop: "10px" }}
            disabled={isLoading}
          >
            Quay lại
          </Button>
        </form>

        {(openDialog || isLoading) && <div className="overlay" />}

        <Dialog
          open={isLoading}
          PaperProps={{
            style: {
              backgroundColor: "transparent",
              boxShadow: "none",
              overflow: "hidden",
            },
          }}
        >
          <DialogContent style={{ textAlign: "center", padding: "40px" }}>
            <CircularProgress size={60} />
            <DialogContentText style={{ marginTop: "20px", color: "#fff" }}>
              Đang ghi dữ liệu...
            </DialogContentText>
          </DialogContent>
        </Dialog>

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{
            style: {
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              boxShadow: "none",
              overflow: "hidden",
            },
          }}
        >
          <DialogContent style={{ textAlign: "center", padding: "40px" }}>
            <IconButton
              color="primary"
              style={{
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <CheckCircleOutlineIcon style={{ fontSize: 60 }} />
            </IconButton>
            <DialogContentText
              id="alert-dialog-description"
              style={{ fontSize: "1.2rem" }}
            >
              Ghi nhận dữ liệu thành công!
            </DialogContentText>
          </DialogContent>
        </Dialog>
      </Container>
    </>
  );
};

export default ResponsiblePersonPage;
