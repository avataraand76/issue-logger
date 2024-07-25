import React, { useState, useMemo } from "react";
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

const ResponsiblePersonPage = () => {
  const [responsiblePerson, setResponsiblePerson] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const peopleList = useMemo(
    () => [
      "ĐẶNG MẠNH CƯỜNG (CƠ ĐIỆN XƯỞNG 1)",
      "TRƯƠNG MAI HIẾU KIỆN (CƠ ĐIỆN XƯỞNG 1)",
      "PHAN THÀNH DƯƠNG (CƠ ĐIỆN XƯỞNG 1)",
      "VÕ TẤN VŨ (CƠ ĐIỆN XƯỞNG 1)",
      "NGUYỄN THỊ KIM TUYÊN (CƠ ĐIỆN XƯỞNG 1)",
      "VÕ VĂN LUẬN (CƠ ĐIỆN XƯỞNG 1)",
      "NGUYỄN THỊ PHƯƠNG LAN (CƠ ĐIỆN XƯỞNG 2)",
      "HUỲNH MINH LỘC (CƠ ĐIỆN XƯỞNG 2)",
      "NGUYỄN THANH PHONG (CƠ ĐIỆN XƯỞNG 2)",
      "ĐINH HÒA THUẬN (CƠ ĐIỆN XƯỞNG 2)",
      "TRỪ TẤN LỘC (CƠ ĐIỆN XƯỞNG 2)",
      "THÁI HỒNG MINH (CƠ ĐIỆN XƯỞNG 2)",
      "LÊ NGUYỄN NGỌC SƠN (CƠ ĐIỆN XƯỞNG 2)",
      "LƯU TẤN TƯỜNG CHINH (CƠ ĐIỆN XƯỞNG 3)",
      "NGUYỄN HỮU ĐỨC (CƠ ĐIỆN XƯỞNG 3)",
      "ĐINH THUẬN HÒA (CƠ ĐIỆN XƯỞNG 3)",
      "NGUYỄN HẢI ĐĂNG (CƠ ĐIỆN XƯỞNG 3)",
      "TRƯƠNG MINH DANH (CƠ ĐIỆN XƯỞNG 3)",
      "DƯƠNG MINH NHÂN (CƠ ĐIỆN XƯỞNG 4)",
      "HÀ THANH TƯỜNG (CƠ ĐIỆN XƯỞNG 4)",
      "NGUYỄN TIẾN THỊNH (CƠ ĐIỆN XƯỞNG 4)",
      "TRẦN HIỀN EM (CƠ ĐIỆN XƯỞNG 4)",
      "LÊ MINH TÂN (CƠ ĐIỆN XƯỞNG 4)",
      "NGUYỄN QUAN HUY (CƠ ĐIỆN XƯỞNG 4)",
      "PHẠM VĂN LƯỢNG (CƠ ĐIỆN XƯỞNG 4)",
      "HUỲNH PHƯƠNG VY (CƠ ĐIỆN XƯỞNG 4)",
      "BÙI TRẦN HỒNG HẠNH (TỔ TRƯỞNG TỔ 01)",
      "TRẦN THỊ KIM DUYÊN (TỔ TRƯỞNG TỐ 02)",
      "HUỲNH THỊ THU DUNG (TỔ TRƯỞNG TỐ 03)",
      "NGUYỄN THỊ HỒNG CƯƠNG (TỔ TRƯỞNG TỔ 04)",
      "NGUYỄN THỊ HỒNG VÂN (TỔ TRƯỞNG TỔ 05)",
      "NGUYỄN THÀNH TÀI (TỔ TRƯỞNG TỔ 06)",
      "NGUYỄN NGỌC BÍCH TRÂM (TỔ TRƯỞNG TỔ 07)",
      "NGUYỄN VÂN CHÂU (TỔ TRƯỞNG TỔ 08)",
      "VÕ THỊ THẢO NGUYÊN (TỔ TRƯỞNG TỔ 10)",
      "LÊ TẤN TÀI (TỔ TRƯỞNG TỔ 10)",
      "LÊ THỊ KIM THOẠI (TỔ TRƯỞNG TỔ 10.1)",
      "PHAN THỊ MỘNG CẦM (TỔ TRƯỞNG TỔ 11)",
      "NGUYỄN THỊ THÚY KIỀU (TỔ TRƯỞNG TỔ 12)",
      "BÙI THỊ LAN ĐÀI (TỔ TRƯỞNG TỔ 15)",
      "HÀ THỊ NGỌC KIỀU (TỔ TRƯỞNG TỔ 16)",
      "NGUYỄN THỊ THÚY NGA (TỔ TRƯỞNG TỔ 17)",
      "TRẦN BÌNH PHÚC (TỔ TRƯỞNG TỔ 19)",
      "NGUYỄN THỊ HOÀNG OANH (TỔ TRƯỞNG TỔ 20)",
      "LÊ NGUYỄN THIỆN TÂM (TỔ TRƯỞNG TỔ 20)",
      "LÊ THỊ THÙY TRANG (TỔ TRƯỞNG TỔ 21)",
      "TRƯƠNG KIM OANH (TỔ TRƯỞNG TỔ 23)",
      "NGUYỄN THỊ NGỌC THI (TỔ TRƯỞNG TỔ 24)",
      "CHÂU THỊ KIM THỦY (TỔ TRƯỞNG TỔ 25)",
      "TRẦN PHẠM THỊ ANH ĐÀO (TỔ TRƯỞNG TỔ 26)",
      "NGUYỄN THỊ THÙY LINH (TỔ TRƯỞNG TỔ 27)",
      "NGUYỄN LAN NHI (TỔ TRƯỞNG TỔ 28)",
      "ĐẶNG THỊ HỒNG NHUNG (TỔ TRƯỞNG TỔ 30)",
      "NGUYỄN THỊ BÍCH HẬU (TỔ TRƯỞNG TỔ 32)",
      "PHẠM CHÍ LINH (TỔ TRƯỞNG TỔ 33)",
      "PHẠM THỊ THẢO NGUYÊN (TỔ TRƯỞNG TỔ 34)",
      "NGUYỄN THỊ NGỌC HÂN (TỔ TRƯỞNG TỔ 35)",
      "BÙI TUYẾT NHƯ (TỔ TRƯỞNG TỔ 37)",
      "TRẦN KHANH QUỐC KHÁNH (TỔ TRƯỞNG TỔ 38)",
      "LÊ THỊ KIM LIÊN (TỔ TRƯỞNG TỔ 40)",
      "TRẦN VĂN MINH (TỔ TRƯỞNG TỔ HOÀN THÀNH 1 - XƯỞNG 4)",
      "NGUYỄN VĂN MẠNH (TỔ TRƯỞNG TỔ HOÀN THÀNH 2 - XƯỞNG 4)",
      "HUỲNH THỊ KIM DUNG (KỸ THUẬT XƯỞNG 1)",
      "NGUYỄN THỊ NGỌC HƯƠNG (KỸ THUẬT XƯỞNG 1)",
      "NGUYỄN THỊ YẾN TRINH (KỸ THUẬT XƯỞNG 1)",
      "LÊ THỊ MỸ DUYÊN (KỸ THUẬT XƯỞNG 1)",
      "PHAN MINH THUẬN (KỸ THUẬT XƯỞNG 1)",
      "HUỲNH ĐÌNH TUẤN (KỸ THUẬT XƯỞNG 1)",
      "TRẦN THANH PHONG (KỸ THUẬT XƯỞNG 1)",
      "LÊ THỊ NGỌC TRINH (KỸ THUẬT XƯỞNG 1)",
      "LÊ LONG HỒ (KỸ THUẬT XƯỞNG 1)",
      "NGUYỄN THỊ KIM THOẠI (KỸ THUẬT XƯỞNG 2)",
      "VÕ MINH TUẤN (KỸ THUẬT XƯỞNG 2)",
      "HUỲNH THỊ THÙY TRANG (KỸ THUẬT XƯỞNG 2)",
      "PHẠM THỊ KIM HOÀI (KỸ THUẬT XƯỞNG 2)",
      "HUỲNH THỊ HẢI ÂU (KỸ THUẬT XƯỞNG 2)",
      "NGUYỄN THỊ DIỄM HƯƠNG (KỸ THUẬT XƯỞNG 2)",
      "NGUYỄN THỊ CẨM TIÊN (KỸ THUẬT XƯỞNG 3)",
      "PHẠM THỊ ANH ĐÀO (KỸ THUẬT XƯỞNG 3)",
      "HUỲNH TRẦN HỒNG THỊNH (KỸ THUẬT XƯỞNG 3)",
      "TĂNG THANH VỦ (KỸ THUẬT XƯỞNG 3)",
      "ĐỖ THỊ NGỌC THI (KỸ THUẬT XƯỞNG 3)",
      "NGUYỄN NGỌC LAN (KỸ THUẬT XƯỞNG 4)",
      "NGUYỄN MINH SANG (KỸ THUẬT XƯỞNG 4)",
      "LÊ MINH DUY (KỸ THUẬT XƯỞNG 4)",
      "VÕ HUỲNH DUY SƠN (KỸ THUẬT XƯỞNG 4)",
      "NGUYỄN HỮU TÀI (KỸ THUẬT XƯỞNG 4)",
    ],
    []
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    // Giả sử bạn có dữ liệu từ các trang trước trong state hoặc context
    // Trong thực tế, bạn cần thay thế các giá trị này bằng dữ liệu thực từ state hoặc context
    const formData = {
      lineNumber: "Line 1", // từ HomePage
      scope: "Máy móc", // từ HomePage
      machineryType: "Thiết bị may", // từ MachineryPage
      code: "1K - Máy 1 kim điện tử", // từ MachineryPage
      issue: "Máy không hoạt động", // từ MachineryPage
      remediation: "Cơ điện sửa máy tại chỗ", // từ MachineryRemediationPage
      responsiblePerson: responsiblePerson,
    };

    // Tạo một mảng chứa dữ liệu cho Excel
    const excelData = [
      [
        "Số chuyền",
        "Phạm vi",
        "Loại máy",
        "Mã thiết bị",
        "Vấn đề",
        "Hành động khắc phục",
        "Người chịu trách nhiệm",
      ],
      [
        formData.lineNumber,
        formData.scope,
        formData.machineryType,
        formData.code,
        formData.issue,
        formData.remediation,
        formData.responsiblePerson,
      ],
    ];

    // Tạo một workbook mới
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "FormData");

    // Tạo file Excel và tải xuống
    XLSX.writeFile(wb, "form_data.xlsx");

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
          value={responsiblePerson}
          onChange={(event, newValue) => {
            setResponsiblePerson(newValue);
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={!responsiblePerson}
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
