import React, { useState } from "react";
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

const MachineryRemediationPage = () => {
  const [remediation, setRemediation] = useState("");
  const [otherRemediation, setOtherRemediation] = useState("");
  const navigate = useNavigate();

  const remediationOptions = [
    "Cơ điện sửa máy tại chỗ",
    "Đổi máy dự phòng",
    "Kỹ thuật điều chỉnh",
    "Nhờ máy chuyền khác tạm thời",
    "Sắp xếp người hỗ trợ",
    "Thông tin cho quản lý",
    "Khác",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalRemediation =
      remediation === "Khác" ? otherRemediation : remediation;
    console.log({ remediation: finalRemediation });
    // Handle form submission here (e.g., send data to server)
    // Then navigate to the next page or back to the home page
    // navigate("/");
    navigate("/responsibleperson");
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom>
        Hành động khắc phục
      </Typography>
      <form onSubmit={handleSubmit}>
        <FormControl component="fieldset" fullWidth margin="normal">
          <RadioGroup
            aria-label="remediation"
            name="remediation"
            value={remediation}
            onChange={(e) => setRemediation(e.target.value)}
          >
            {remediationOptions.map((option) => (
              <FormControlLabel
                key={option}
                value={option}
                control={<Radio />}
                label={option}
              />
            ))}
          </RadioGroup>
        </FormControl>
        {remediation === "Khác" && (
          <TextField
            label="Nhập hành động khắc phục khác"
            value={otherRemediation}
            onChange={(e) => setOtherRemediation(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: otherRemediation && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear input"
                    onClick={() => setOtherRemediation("")}
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
            !remediation || (remediation === "Khác" && !otherRemediation)
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
          Quay lại
        </Button>
      </form>
    </Container>
  );
};

export default MachineryRemediationPage;
