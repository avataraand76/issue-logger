// src/pages/ResponsiblePersonPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  Typography,
  Autocomplete,
  TextField,
  Snackbar,
} from "@mui/material";
import * as XLSX from "xlsx";
import { useFormContext } from "../context/FormContext";
import peopleList from "../data/peopleList"; // Import danh sách từ tệp

const ResponsiblePersonPage = () => {
  const { formData, updateFormData } = useFormContext();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Lấy thời gian hiện tại khi gửi form
    const timestamp = new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Cập nhật formData với thời gian và người chịu trách nhiệm
    updateFormData({
      submissionTime: timestamp,
      responsiblePerson: formData.responsiblePerson,
    });

    // Tạo một mảng chứa dữ liệu cho Excel
    const excelData = [
      [
        "Thời gian điền form",
        "Số chuyền",
        "Phạm vi vấn đề",
        "Loại máy",
        "Mã thiết bị",
        "Vấn đề",
        "Hành động khắc phục",
        "Người chịu trách nhiệm",
      ],
      [
        timestamp, // Sử dụng thời gian hiện tại
        formData.lineNumber,
        formData.scope,
        formData.machineryType,
        formData.code ? `${formData.code.value} - ${formData.code.label}` : "",
        formData.issue === "Khác"
          ? `Khác - ${formData.otherIssue}`
          : formData.issue,
        formData.remediation === "Khác"
          ? `Khác - ${formData.otherRemediation}`
          : formData.remediation,
        formData.responsiblePerson,
      ],
    ];

    // Tạo một workbook mới
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "FormData");

    // Tạo tên file với ngày giờ
    const date = new Date();
    const formattedDate = `${date.getHours()}h${date.getMinutes()}__${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()}`;
    const fileName = `form_data_${formattedDate}.xlsx`;

    // Tạo file Excel và tải xuống
    XLSX.writeFile(wb, fileName);

    // Hiển thị thông báo
    setOpenSnackbar(true);

    // Sau 2 giây, chuyển hướng về trang chủ
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom>
        Người chịu trách nhiệm
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
          disabled={!formData.responsiblePerson}
        >
          Xác nhận
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          onClick={() => navigate(-1)}
          style={{ marginTop: "10px" }}
        >
          Quay lại
        </Button>
      </form>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message="File Excel đã được tạo và tải xuống thành công!"
      />
    </Container>
  );
};

export default ResponsiblePersonPage;
