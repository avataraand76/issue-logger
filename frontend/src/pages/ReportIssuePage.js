// frontend/src/pages/ReportIssuePage.js
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
  Switch,
  FormControlLabel,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useFormContext } from "../context/FormContext";
import Header from "../components/Header";
import { addIssue, fetchEmployees, fetchLines } from "../data/api";
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
  const [isChangeover, setIsChangeover] = useState(false);
  const [oldProductCode, setOldProductCode] = useState("");
  const [newProductCode, setNewProductCode] = useState("");
  const [lineNumbers, setLineNumbers] = useState([]);

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
  ];

  useEffect(() => {
    const loadLines = async () => {
      try {
        const lines = await fetchLines();
        const formattedLines = lines.map((line) => ({
          value: line.id_line,
          label: line.name_line,
          id_workshop: line.id_workshop,
        }));
        setLineNumbers(formattedLines);
      } catch (error) {
        console.error("Error loading lines:", error);
      }
    };

    loadLines();
  }, []);

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

  const isSubmitDisabled = () => {
    if (!formData.responsiblePerson) return true;
    if (isChangeover && (!oldProductCode || !newProductCode)) return true;
    return false;
  };

  const handleStationDelete = (stationToDelete) => () => {
    setSelectedStations(
      selectedStations.filter((station) => station !== stationToDelete)
    );
  };

  const handleOldProductCodeChange = (e) => {
    setOldProductCode(e.target.value.toUpperCase());
  };

  const handleNewProductCodeChange = (e) => {
    setNewProductCode(e.target.value.toUpperCase());
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      for (const stationNumber of selectedStations) {
        const data = {
          submissionTime: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          lineNumber: formData.lineNumber,
          stationNumber,
          scope: formData.scope.toUpperCase(),
          responsiblePerson: formData.responsiblePerson,
          oldProductCode: isChangeover ? oldProductCode : null,
          newProductCode: isChangeover ? newProductCode : null,
          status_logged_issue: "pending",
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

  const filterPeopleList = async (lineNumber) => {
    if (!lineNumber) {
      setFilteredPeopleList([]);
      return;
    }

    try {
      const line = lineNumbers.find((l) => l.label === lineNumber);

      if (line) {
        // Truyền workshopId nhưng API sẽ lấy id_workshop từ tb_line
        const employees = await fetchEmployees(line.id_workshop, lineNumber);
        setFilteredPeopleList(employees);
      } else {
        setFilteredPeopleList([]);
      }
    } catch (error) {
      console.error("Error in filterPeopleList:", error);
      setFilteredPeopleList([]);
    }
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
          <Autocomplete
            options={lineNumbers}
            getOptionLabel={(option) => option.label}
            onChange={(event, newValue) => {
              console.log("Selected Line Details:", {
                id_line: newValue?.value,
                id_workshop: newValue?.id_workshop,
                label: newValue?.label,
              });
              updateFormData({ lineNumber: newValue ? newValue.label : "" });
              if (newValue) {
                filterPeopleList(newValue.label);
              }
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
            onClick={() => navigate("/")}
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
              getOptionLabel={(option) => {
                if (typeof option === "object" && option !== null) {
                  return `${option.position} - ${option.full_name}`;
                }
                return option || "";
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Chọn người ghi nhận vấn đề"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                />
              )}
              value={formData.responsiblePerson || null}
              onChange={(event, newValue) => {
                updateFormData({
                  responsiblePerson: newValue
                    ? `${newValue.position} - ${newValue.full_name}`
                    : null,
                });
              }}
              renderOption={(props, option) => (
                <li {...props} style={{ whiteSpace: "normal" }}>
                  {`${option.position} - ${option.full_name}`}
                </li>
              )}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isChangeover}
                  onChange={(e) => setIsChangeover(e.target.checked)}
                  name="chuyenDoi"
                  color="primary"
                />
              }
              label="Chuyển đổi"
            />
            {isChangeover && (
              <>
                <TextField
                  label="Mã hàng cũ"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={oldProductCode}
                  onChange={handleOldProductCodeChange}
                  inputProps={{ style: { textTransform: "uppercase" } }}
                />
                <TextField
                  label="Mã hàng mới"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={newProductCode}
                  onChange={handleNewProductCodeChange}
                  inputProps={{ style: { textTransform: "uppercase" } }}
                />
              </>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isSubmitDisabled() || isLoading}
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
