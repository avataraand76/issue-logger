import React, { useState } from "react";
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

const ResponsiblePersonPage = () => {
  const { formData, updateFormData } = useFormContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const timestamp = new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const data = {
      submissionTime: timestamp,
      lineNumber: formData.lineNumber,
      scope: formData.scope,
      machineryType: formData.machineryType,
      code: formData.code
        ? `${formData.code.value} - ${formData.code.label}`
        : "",
      issue:
        formData.issue === "Khác"
          ? `Khác - ${formData.otherIssue}`
          : formData.issue,
      remediation:
        formData.remediation === "Khác"
          ? `Khác - ${formData.otherRemediation}`
          : formData.remediation,
      responsiblePerson: formData.responsiblePerson,
    };

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxLCStzUjhCrPEU65FqOivlXHWgTn7jSAQdFzb9XbH4tUBPMY4pB7HMVb7YJz2YwEB5Hg/exec",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        setIsLoading(false);
        setOpenDialog(true);
        setTimeout(() => {
          handleCloseDialog();
        }, 2000);
      } else {
        throw new Error("Failed to save data");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      setIsLoading(false);
      // Xử lý lỗi ở đây
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    navigate("/");
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom>
        NGƯỜI CHỊU TRÁCH NHIỆM
      </Typography>
      <form onSubmit={handleSubmit}>
        <Autocomplete
          options={peopleList}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Chọn người chịu trách nhiệm"
              variant="outlined"
              fullWidth
              margin="normal"
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
  );
};

export default ResponsiblePersonPage;
