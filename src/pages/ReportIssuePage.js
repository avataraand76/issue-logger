// src/pages/ReportIssuePage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  TextField,
  Typography,
  Autocomplete,
  Grid,
  Chip,
  Box,
  Dialog,
  DialogContent,
  DialogContentText,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useFormContext } from "../context/FormContext";
import Header from "../components/Header";
import AutofillPreventer from "../components/AutofillPreventer";
import getPeopleList from "../data/peopleList";
import { addIssue } from "../data/api";
import { format } from "date-fns";
import EngineeringIcon from "@mui/icons-material/Engineering";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import SettingsIcon from "@mui/icons-material/Settings";

const ReportIssuePage = () => {
  const { formData, updateFormData, resetFormData } = useFormContext();
  const navigate = useNavigate();
  const [selectedStations, setSelectedStations] = useState([]);
  const [stationInput, setStationInput] = useState({ value: "", error: "" });
  const [filteredPeopleList, setFilteredPeopleList] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [peopleList, setPeopleList] = useState({});

  useEffect(() => {
    const fetchPeopleList = async () => {
      const fetchedPeopleList = await getPeopleList();
      setPeopleList(fetchedPeopleList);
    };

    fetchPeopleList();
  }, []);

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
    {
      value: "Máy móc",
      label: "Máy móc",
      color: "error",
      icon: <EngineeringIcon />,
    },
    {
      value: "Con người",
      label: "Con người",
      color: "warning",
      icon: <PeopleIcon />,
    },
    {
      value: "Nguyên phụ liệu",
      label: "Nguyên phụ liệu",
      color: "primary",
      icon: <InventoryIcon />,
    },
    {
      value: "Phương pháp",
      label: "Phương pháp",
      color: "success",
      icon: <SettingsIcon />,
    },
    // { value: "Khác", label: "Khác" },
  ];

  const handleScopeSelection = (selectedScope) => {
    updateFormData({ scope: selectedScope, stationNumbers: selectedStations });

    if (!formData.lineNumber || selectedStations.length === 0) return;

    // Filter the people list based on the selected line number
    filterPeopleList(formData.lineNumber);

    // Open the dialog to select the responsible person
    setOpenDialog(true);
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

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      for (const stationNumber of formData.stationNumbers) {
        const data = {
          action: "addIssue",
          submissionTime: format(new Date(), "HH:mm MM/dd/yyyy", {
            timeZone: "Asia/Ho_Chi_Minh",
          }),
          lineNumber: formData.lineNumber,
          scope: formData.scope,
          responsiblePerson: formData.responsiblePerson,
          stationNumber,
        };
        const result = await addIssue(data);
        if (result.status !== "success") {
          throw new Error(result.message || "Failed to save data");
        }
      }
      setIsLoading(false);
      setShowSuccessDialog(true);
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

  const filterPeopleList = (lineNumber) => {
    if (!lineNumber || Object.keys(peopleList).length === 0) {
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

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        entry.target.dispatchEvent(new Event("resize", { bubbles: true }));
      }
    });

    // Observe the entire document
    resizeObserver.observe(document.body);

    // Cleanup function to disconnect the ResizeObserver when the component is unmounted
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <>
      <Header />
      <Container maxWidth="sm">
        <Typography variant="h5" gutterBottom align="center">
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
          <Box sx={{ mt: 1, mb: 2 }}>
            {selectedStations.map((station) => (
              <Chip
                key={station}
                label={station}
                onDelete={handleStationDelete(station)}
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
          <Typography
            variant="subtitle1"
            gutterBottom
            align="center"
            sx={{ mt: 3, mb: 2 }}
          >
            Chọn phạm vi vấn đề:
          </Typography>
          <Grid container spacing={2}>
            {scopes.map((scope) => (
              <Grid item xs={12} sm={6} key={scope.value}>
                <Button
                  variant="contained"
                  color={scope.color}
                  fullWidth
                  onClick={() => handleScopeSelection(scope.value)}
                  disabled={
                    !formData.lineNumber || selectedStations.length === 0
                  }
                  sx={{
                    py: 2,
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {scope.icon}
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
            sx={{ mt: 3, py: 1.5, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
          >
            Back
          </Button>
        </form>
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{
            style: {
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              boxShadow: "none",
              overflow: "hidden",
              width: "100%",
            },
          }}
        >
          <DialogContent style={{ textAlign: "center", padding: "40px" }}>
            <Typography variant="h5" gutterBottom>
              NGƯỜI GHI NHẬN VẤN ĐỀ
            </Typography>
            <Autocomplete
              options={filteredPeopleList}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Chọn người ghi nhận vấn đề"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  multiline
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
              onClick={handleSubmit}
            >
              Xác nhận
            </Button>
          </DialogContent>
        </Dialog>

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

        {(openDialog || isLoading) && <div className="overlay" />}
        <Dialog
          open={showSuccessDialog}
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

export default ReportIssuePage;
