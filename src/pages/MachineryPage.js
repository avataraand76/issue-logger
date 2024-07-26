// src/pages/MachineryPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  MenuItem,
  Autocomplete,
  InputAdornment,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const MachineryPage = () => {
  const [machineryType, setMachineryType] = useState("");
  const [code, setCode] = useState(null);
  const [issue, setIssue] = useState(null);
  const [otherIssue, setOtherIssue] = useState("");
  const navigate = useNavigate();

  const machineryCodes = {
    sewing: [
      { value: "1K", label: "Máy 1 kim điện tử" },
      { value: "2K", label: "Máy 2 kim" },
      { value: "1KBT", label: "Máy may bo tay 1 kim điện tử" },
      { value: "2KBT", label: "Máy may bo tay 2 kim" },
      { value: "1KMX", label: "Máy 1 kim móc xích" },
      { value: "2KMX", label: "Máy 2 kim móc xích" },
      { value: "VS", label: "Máy vắt sổ" },
      { value: "VSDT", label: "Máy vắt sổ 4 chỉ đầu túm" },
      { value: "VSCV", label: "Máy vắt sổ xén cuốn viền" },
      { value: "1KB", label: "Máy 1 kim bước" },
    ],
    specialized: [
      { value: "1KX", label: "Máy xén 1 kim" },
      { value: "LT", label: "Máy lập trình BAS-326H" },
      { value: "LTT", label: "Máy lập trình khổ trung" },
      { value: "LTL", label: "Máy lập trình khổ lớn" },
      { value: "DB", label: "Máy đính bọ điện tử" },
      { value: "TK", label: "Máy thùa khuy thẳng điện tử" },
      { value: "DN", label: "Máy dập nút" },
      { value: "Z3", label: "Máy ziczac 3 bước" },
      { value: "Z2", label: "Máy ziczac 2 bước" },
      { value: "KS", label: "Máy Kansai" },
      { value: "EN", label: "Máy ép nhãn" },
      { value: "ETD", label: "Máy ép thanh dài H&H" },
      { value: "EKN", label: "Máy ép nhãn 2 mâm khổ nhỏ H&H" },
      { value: "DNU", label: "Máy đính nút" },
      { value: "SC", label: "Máy sang chỉ" },
      { value: "MDB", label: "Máy đánh bông" },
      { value: "DBT", label: "Máy đánh bông đầu trung" },
      { value: "DBDT", label: "Máy đánh bông đầu túm" },
      { value: "FLAT", label: "Máy Flatseam" },
      { value: "CS", label: "Máy cuốn sườn" },
      { value: "LNT", label: "Máy lộn nắp túi" },
      { value: "EK", label: "Máy ép keo" },
      { value: "DBDH", label: "Máy đánh bông đầu heo" },
      { value: "TKDT", label: "Máy thùa khuy đầu tròn" },
      { value: "MT", label: "Máy mổ túi" },
      { value: "CT5", label: "Máy cắt tay KM 5''" },
      { value: "CT8", label: "Máy cắt tay KM 8''" },
      { value: "CT10", label: "Máy cắt tay KM 10''" },
      { value: "CT13", label: "Máy cắt tay KM 13''" },
      { value: "CT15", label: "Máy cắt tay KSM 15''" },
      { value: "MDK", label: "Máy dò kim" },
      { value: "DDN", label: "Máy đính đạn nhựa" },
      { value: "CS3K", label: "Máy cuốn sườn 3 kim" },
    ],
    tools: [
      { value: "BH", label: "Bàn hút chân không" },
      { value: "MAC", label: "Bàn ủi hơi nhiệt Macpi" },
      { value: "BUT", label: "Bàn ủi treo" },
      { value: "BUTH", label: "Bàn ủi toàn hơi" },
      { value: "TL1K", label: "Trợ lực 1 kim" },
      { value: "TL2K", label: "Trợ lực 2 kim" },
      { value: "TLVS", label: "Trợ lực vắt sổ" },
      { value: "TLCS", label: "Trợ lực cuốn sườn" },
      { value: "DTT", label: "Bộ điều tiết thun" },
      { value: "XDV", label: "Bộ xả dây viền" },
      { value: "NH9", label: "Nồi hơi điện 9KW" },
      { value: "NH18", label: "Nồi hơi điện 18KW" },
      { value: "BAN", label: "Bàn" },
      { value: "BANL", label: "Bàn lộn" },
      { value: "TLDB", label: "Trợ lực đánh bông" },
      { value: "BCT", label: "Bộ căng thun" },
      { value: "BUTG", label: "Bàn ủi tam giác" },
      { value: "BUN", label: "Bàn ủi nhiệt" },
    ],
  };

  const issueOptions = [
    "Máy nỗi chỉ",
    "Máy may gãy kim",
    "Máy không cắt chỉ",
    "Máy may không đạt tiêu chuẩn chất lượng (nhăn, vặn xếp ly, lùa....)",
    "Máy hư bàn lừa/chân vịt/các bộ phận khác của máy....",
    "Máy bị sự cố không hoạt động",
    "Máy hư dây ổ cắm",
    "Lỗi phần mềm",
    "Máy hư dao",
    "Máy hư linh kiện",
    "Máy chưa được chuẩn bị",
    "Máy còn sử dụng may mã hàng cũ",
    "Rập bị hư",
    "Cử gắn sai",
    "Máy bỏ mũi",
    "Máy lỏng chỉ",
    "Bàn ủi thiếu hơi",
    "Bàn ủi ra nước",
    "Máy hư bàn đạp",
    "Thay đổi cự lý máy",
    "Máy may bể vải",
    "Máy rối chỉ",
    "May không ôm bờ",
    "Mí không đều",
    "Máy không có điện",
    "Khác",
  ];

  const isFormValid = () => {
    if (!machineryType || !code) return false;
    if (issue === "Khác") return otherIssue.trim() !== "";
    return !!issue;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    const finalIssue = issue === "Khác" ? otherIssue : issue;
    console.log({ machineryType, code: code?.value, issue: finalIssue });
    navigate("/machineryremediation");
  };

  useEffect(() => {
    // Reset code when machineryType changes
    setCode(null);
  }, [machineryType]);

  return (
    <Container maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <TextField
          select
          label="Chủng loại thiết bị"
          value={machineryType}
          onChange={(e) => setMachineryType(e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
        >
          <MenuItem value="sewing">Thiết bị may</MenuItem>
          <MenuItem value="specialized">Thiết bị chuyên dùng</MenuItem>
          <MenuItem value="tools">Công cụ thiết bị</MenuItem>
        </TextField>
        {machineryType && (
          <Autocomplete
            value={code}
            options={machineryCodes[machineryType] || []}
            getOptionLabel={(option) => `${option.value} - ${option.label}`}
            onChange={(e, newValue) => setCode(newValue)}
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
          value={issue}
          options={issueOptions}
          onChange={(e, newValue) => {
            setIssue(newValue);
            if (newValue !== "Khác") setOtherIssue("");
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
        {issue === "Khác" && (
          <TextField
            label="Nhập vấn đề khác"
            value={otherIssue}
            onChange={(e) => setOtherIssue(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: otherIssue && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear input"
                    onClick={() => setOtherIssue("")}
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
  );
};

export default MachineryPage;
