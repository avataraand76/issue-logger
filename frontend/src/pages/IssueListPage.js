// frontend/src/pages/IssueListPage.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  CircularProgress,
  Box,
  Fade,
  IconButton,
  TextField,
  DialogActions,
  DialogTitle,
  Autocomplete,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import Header from "../components/Header";
import IssueFilters from "../components/IssueFilters";
import IssueDetails from "../components/IssueDetails";
import { useNavigate } from "react-router-dom";
import { format, differenceInMinutes, setHours, setMinutes } from "date-fns";
import LoadingAnimation from "../components/LoadingAnimation";
import {
  fetchIssues,
  endIssue,
  fetchIssuesByCategory,
  fetchSolutionsByCategory,
  fetchMachineryCategories,
  fetchMachineryByCategory,
  fetchEmployees,
} from "../data/api";
import Pagination from "../components/Pagination";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ClearIcon from "@mui/icons-material/Clear";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TimerIcon from "@mui/icons-material/Timer";

const IssueListPage = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [issuesPerPage] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const [openEndIssueDialog, setOpenEndIssueDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [issueDescription, setIssueDescription] = useState("");
  const [solution, setSolution] = useState("");
  const [responsiblePerson, setResponsiblePerson] = useState("");
  const [endTime, setEndTime] = useState("");
  const [downtimeMinutes, setDowntimeMinutes] = useState(0);
  const [filteredPeopleList, setFilteredPeopleList] = useState([]);
  const [filteredIssueOptions, setFilteredIssueOptions] = useState([]);
  const [otherIssue, setOtherIssue] = useState("");
  const [currentSolutionOptions, setCurrentSolutionOptions] = useState([]);
  const [otherSolution, setOtherSolution] = useState("");
  const [machineryType, setMachineryType] = useState("");
  const [machineryCode, setMachineryCode] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [machineryCategories, setMachineryCategories] = useState([]);
  const [machineryList, setMachineryList] = useState([]);
  const [selectedMachineryCategory, setSelectedMachineryCategory] =
    useState("");
  const [selectedMachinery, setSelectedMachinery] = useState(null);

  const calculateDowntimeMinutes = (startTime, endTime) => {
    try {
      // Chuyển đổi định dạng từ "HH:mm dd/MM/yyyy" sang Date object
      const [startTimeStr, startDateStr] = startTime.split(" ");
      const [startDay, startMonth, startYear] = startDateStr.split("/");
      const [startHour, startMinute] = startTimeStr.split(":");

      const [endTimeStr, endDateStr] = endTime.split(" ");
      const [endDay, endMonth, endYear] = endDateStr.split("/");
      const [endHour, endMinute] = endTimeStr.split(":");

      // Set minutes and seconds to exact values
      const start = new Date(
        startYear,
        startMonth - 1,
        startDay,
        startHour,
        startMinute,
        0
      );
      const end = new Date(
        endYear,
        endMonth - 1,
        endDay,
        endHour,
        endMinute,
        0
      );

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn("Invalid date in calculateDowntimeMinutes");
        return 0;
      }

      let minutes = differenceInMinutes(end, start);

      // Xử lý giờ nghỉ trưa
      const lunchBreakStart = setHours(setMinutes(new Date(start), 15), 12);
      const lunchBreakEnd = setHours(setMinutes(new Date(start), 15), 13);

      if (start < lunchBreakEnd && end > lunchBreakStart) {
        // Kiểm tra xem có bao gồm toàn bộ giờ nghỉ trưa không
        if (start <= lunchBreakStart && end >= lunchBreakEnd) {
          minutes -= 60; // Trừ đi 60 phút nghỉ trưa
        } else if (start <= lunchBreakStart) {
          // Chỉ tính từ đầu đến hết giờ nghỉ
          const lunchMinutes = differenceInMinutes(end, lunchBreakStart);
          minutes -= Math.min(60, lunchMinutes);
        } else if (end >= lunchBreakEnd) {
          // Chỉ tính từ đầu giờ nghỉ đến cuối
          const lunchMinutes = differenceInMinutes(lunchBreakEnd, start);
          minutes -= Math.min(60, lunchMinutes);
        } else {
          // Thời gian nằm hoàn toàn trong giờ nghỉ trưa
          minutes = 0;
        }
      }

      return Math.max(0, minutes);
    } catch (error) {
      console.error("Error calculating downtime minutes:", error, {
        startTime,
        endTime,
      });
      return 0;
    }
  };

  useEffect(() => {
    const fetchIssuesData = async () => {
      setLoading(true);
      try {
        const data = await fetchIssues();
        if (Array.isArray(data)) {
          const formattedData = data
            .filter((issue) => issue.status_logged_issue === "pending")
            .map((issue) => ({
              ...issue,
              end_time: issue.end_time ? formatDateTime(issue.end_time) : null,
              submission_time: formatDateTime(issue.submission_time),
            }))
            .sort(
              (a, b) =>
                new Date(b.submission_time) - new Date(a.submission_time)
            );
          setIssues(formattedData);
          setFilteredIssues(formattedData);
        }
      } catch (error) {
        console.error("Error fetching issues:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssuesData();
  }, []);

  const formatDateTime = (dateTimeStr) => {
    try {
      if (!dateTimeStr) return "";

      // Kiểm tra nếu dateTimeStr đã ở định dạng hiển thị
      if (dateTimeStr.includes("/")) {
        return dateTimeStr;
      }

      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date:", dateTimeStr);
        return "";
      }

      return format(date, "HH:mm dd/MM/yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  useEffect(() => {
    let result = [...issues];

    // Filter by search term
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter((issue) => {
        return (
          // Tìm theo line
          (issue.line_number &&
            issue.line_number
              .toString()
              .toLowerCase()
              .includes(searchTermLower)) ||
          // Tìm theo trạm
          (issue.station_number &&
            issue.station_number
              .toString()
              .toLowerCase()
              .includes(searchTermLower)) ||
          // Tìm theo scope (name_category)
          (issue.scope &&
            issue.scope.toLowerCase().includes(searchTermLower)) ||
          // Tìm theo người ghi nhận
          (issue.responsible_person &&
            issue.responsible_person.toLowerCase().includes(searchTermLower))
        );
      });
    }

    setFilteredIssues(result);
  }, [issues, searchTerm]);

  useEffect(() => {
    const checkFormValidity = () => {
      let isValid = true;

      if (!issueDescription) isValid = false;
      if (issueDescription === "Khác" && !otherIssue) isValid = false;
      if (!solution) isValid = false;
      if (solution === "Khác" && !otherSolution) isValid = false;
      if (!responsiblePerson) isValid = false;

      if (selectedIssue && selectedIssue.scope === "Máy móc") {
        if (!machineryType) isValid = false;
        if (!machineryCode) isValid = false;
      }

      setIsFormValid(isValid);
    };

    checkFormValidity();
  }, [
    issueDescription,
    otherIssue,
    solution,
    otherSolution,
    responsiblePerson,
    machineryType,
    machineryCode,
    selectedIssue,
  ]);

  const filterPeopleList = useCallback(async (selectedIssue) => {
    if (!selectedIssue) {
      setFilteredPeopleList([
        { full_name: "CÔNG NHÂN TỰ XỬ LÝ", position: "" },
      ]);
      return;
    }

    try {
      let workshopId;
      const lineNumber = selectedIssue.line_number;

      // Xác định workshop ID dựa trên line number
      if (lineNumber.includes("Line")) {
        const lineNum = parseInt(lineNumber.replace("Line ", ""));
        if (lineNum >= 1 && lineNum <= 10) {
          workshopId = 1;
        } else if (
          (lineNum >= 11 && lineNum <= 20) ||
          lineNumber.includes("20.01")
        ) {
          workshopId = 2;
        } else if (lineNum >= 21 && lineNum <= 30) {
          workshopId = 3;
        } else if (lineNum >= 31 && lineNum <= 40) {
          workshopId = 4;
        }
      } else if (lineNumber.includes("xưởng 4")) {
        workshopId = 4;
      }

      if (workshopId) {
        const employees = await fetchEmployees(workshopId, lineNumber);
        setFilteredPeopleList([
          ...employees,
          { full_name: "CÔNG NHÂN TỰ XỬ LÝ", position: "" },
        ]);
      } else {
        setFilteredPeopleList([
          { full_name: "CÔNG NHÂN TỰ XỬ LÝ", position: "" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setFilteredPeopleList([
        { full_name: "CÔNG NHÂN TỰ XỬ LÝ", position: "" },
      ]);
    }
  }, []);

  // Modify filterIssueOptions to use id_category from selectedIssue
  const filterIssueOptions = useCallback(async () => {
    if (!selectedIssue || !selectedIssue.id_category) return;

    try {
      const [issues, solutions] = await Promise.all([
        fetchIssuesByCategory(selectedIssue.id_category),
        fetchSolutionsByCategory(selectedIssue.id_category),
      ]);

      setFilteredIssueOptions(issues.map((issue) => issue.name_issue));
      setCurrentSolutionOptions(
        solutions.map((solution) => solution.name_solution)
      );
    } catch (error) {
      console.error("Error fetching options:", error);
      setFilteredIssueOptions([]);
      setCurrentSolutionOptions([]);
    }
  }, [selectedIssue]);

  useEffect(() => {
    if (selectedIssue) {
      filterPeopleList(selectedIssue);
      filterIssueOptions();
    }
  }, [selectedIssue, filterPeopleList, filterIssueOptions]);

  // Modify handleEndIssue to include id_category
  const handleEndIssue = (issue) => {
    try {
      const currentTime = format(new Date(), "HH:mm dd/MM/yyyy");

      setEndTime(currentTime);
      const minutes = calculateDowntimeMinutes(
        issue.submission_time,
        currentTime
      );

      setDowntimeMinutes(minutes);
      setSelectedIssue(issue);
      setOpenEndIssueDialog(true);
    } catch (error) {
      console.error("Error in handleEndIssue:", error);
    }
  };

  const handleCloseEndIssueDialog = () => {
    setOpenEndIssueDialog(false);
    setSelectedIssue(null);
    setIssueDescription("");
    setSolution("");
    setResponsiblePerson("");
    setEndTime("");
    setDowntimeMinutes(0);
    setOtherIssue("");
    setOtherSolution("");
    setMachineryType("");
    setMachineryCode(null);
  };

  const handleConfirmEndIssue = async () => {
    setIsLoading(true);
    try {
      // Format endTime từ "HH:mm DD/MM/YYYY" sang "YYYY-MM-DD HH:mm:00"
      const [time, date] = endTime.split(" ");
      const [day, month, year] = date.split("/");
      const formattedEndTime = `${year}-${month}-${day} ${time}:00`;

      // Lấy giá trị machinery_type và machinery_code
      const machineryType = selectedMachineryCategory
        ? machineryCategories.find(
            (cat) => cat.id_machinery_category === selectedMachineryCategory
          )?.name_machinery_category
        : null;

      const machineryCode = selectedMachinery
        ? `${selectedMachinery.code_machinery} - ${selectedMachinery.name_machinery}`
        : null;

      const result = await endIssue(
        selectedIssue.id_logged_issue,
        formattedEndTime,
        {
          downtimeMinutes,
          machineryType, // Gửi tên loại thiết bị
          machineryCode, // Gửi mã và tên thiết bị
          issueDescription:
            issueDescription === "KHÁC"
              ? `KHÁC - ${otherIssue}`
              : issueDescription,
          solutionDescription:
            solution === "KHÁC" ? `KHÁC - ${otherSolution}` : solution,
          problemSolver: responsiblePerson,
        }
      );

      if (result.status === "success") {
        setShowSuccess(true);
        setTimeout(() => {
          handleCloseEndIssueDialog();
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error("Error ending issue:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleExpand = (id) => {
    setExpandedIssue(expandedIssue === id ? null : id);
  };

  const indexOfLastIssue = currentPage * issuesPerPage;
  const indexOfFirstIssue = indexOfLastIssue - issuesPerPage;
  const currentIssues = filteredIssues.slice(
    indexOfFirstIssue,
    indexOfLastIssue
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (selectedIssue) {
      filterPeopleList(selectedIssue);
    }
  }, [selectedIssue, filterPeopleList]);

  useEffect(() => {
    const loadMachineryCategories = async () => {
      try {
        const categories = await fetchMachineryCategories();
        setMachineryCategories(categories);
      } catch (error) {
        console.error("Error loading machinery categories:", error);
      }
    };
    loadMachineryCategories();
  }, []);

  useEffect(() => {
    const loadMachinery = async () => {
      if (!selectedMachineryCategory) {
        setMachineryList([]);
        return;
      }
      try {
        const machinery = await fetchMachineryByCategory(
          selectedMachineryCategory
        );
        setMachineryList(machinery);
      } catch (error) {
        console.error("Error loading machinery:", error);
      }
    };
    loadMachinery();
  }, [selectedMachineryCategory]);

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <Button
          onClick={handleBack}
          variant="outlined"
          style={{ marginBottom: "20px" }}
        >
          Quay lại
        </Button>
        <Typography textAlign="center" variant="h4" gutterBottom>
          DANH SÁCH VẤN ĐỀ DOWNTIME
        </Typography>
        {loading ? (
          <LoadingAnimation />
        ) : (
          <>
            <IssueFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <Box mt={2} mb={2}>
              <Pagination
                issuesPerPage={issuesPerPage}
                totalIssues={filteredIssues.length}
                paginate={paginate}
                currentPage={currentPage}
              />
            </Box>
            <Fade in={!loading} timeout={1000}>
              <Box>
                <IssueDetails
                  filteredIssues={currentIssues}
                  expandedIssue={expandedIssue}
                  handleExpand={handleExpand}
                  handleEndIssue={handleEndIssue}
                />
              </Box>
            </Fade>
          </>
        )}
      </Container>

      <Dialog
        open={openEndIssueDialog}
        onClose={handleCloseEndIssueDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle textAlign={"center"}>
          {selectedIssue &&
          selectedIssue.old_product_code &&
          selectedIssue.new_product_code
            ? `KẾT THÚC THỜI GIAN DOWNTIME - CHUYỂN ĐỔI [${selectedIssue.old_product_code}] -> [${selectedIssue.new_product_code}]`
            : "KẾT THÚC THỜI GIAN DOWNTIME"}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Thời gian kết thúc"
            type="text"
            fullWidth
            variant="outlined"
            value={endTime}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <AccessTimeIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="dense"
            label="Số phút downtime"
            type="number"
            fullWidth
            variant="outlined"
            value={downtimeMinutes}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <TimerIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">phút</InputAdornment>
              ),
            }}
          />
          {selectedIssue && selectedIssue.scope === "MÁY MÓC" && (
            <>
              <TextField
                select
                label="Chọn loại thiết bị"
                value={selectedMachineryCategory}
                onChange={(e) => {
                  setSelectedMachineryCategory(e.target.value);
                  setSelectedMachinery(null);
                }}
                variant="outlined"
                fullWidth
                margin="dense"
              >
                {machineryCategories.map((category) => (
                  <MenuItem
                    key={category.id_machinery_category}
                    value={category.id_machinery_category}
                  >
                    {category.name_machinery_category}
                  </MenuItem>
                ))}
              </TextField>

              {selectedMachineryCategory && (
                <Autocomplete
                  value={selectedMachinery}
                  options={machineryList}
                  getOptionLabel={(option) =>
                    `${option.code_machinery} - ${option.name_machinery}`
                  }
                  onChange={(e, newValue) => setSelectedMachinery(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Mã thiết bị"
                      variant="outlined"
                      margin="dense"
                      fullWidth
                    />
                  )}
                />
              )}
            </>
          )}
          <Autocomplete
            options={[...filteredIssueOptions, "KHÁC"]}
            renderInput={(params) => (
              <TextField
                {...params}
                margin="dense"
                label="Mô tả vấn đề"
                fullWidth
                variant="outlined"
              />
            )}
            value={issueDescription}
            onChange={(event, newValue) => {
              setIssueDescription(newValue);
              if (newValue !== "KHÁC") {
                setOtherIssue("");
              }
            }}
          />
          {issueDescription === "KHÁC" && (
            <TextField
              margin="dense"
              label="Nhập vấn đề khác"
              type="text"
              fullWidth
              variant="outlined"
              value={otherIssue}
              onChange={(e) => setOtherIssue(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setOtherIssue("")} edge="end">
                    <ClearIcon />
                  </IconButton>
                ),
              }}
            />
          )}
          <Autocomplete
            options={[...currentSolutionOptions, "KHÁC"]}
            renderInput={(params) => (
              <TextField
                {...params}
                margin="dense"
                label="Phương án giải quyết"
                fullWidth
                variant="outlined"
              />
            )}
            value={solution}
            onChange={(event, newValue) => {
              setSolution(newValue);
              if (newValue !== "KHÁC") {
                setOtherSolution("");
              }
            }}
          />
          {solution === "KHÁC" && (
            <TextField
              margin="dense"
              label="Nhập phương án giải quyết khác"
              type="text"
              fullWidth
              variant="outlined"
              value={otherSolution}
              onChange={(e) => setOtherSolution(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setOtherSolution("")} edge="end">
                    <ClearIcon />
                  </IconButton>
                ),
              }}
            />
          )}
          <Autocomplete
            options={filteredPeopleList}
            getOptionLabel={(option) => {
              if (!option || typeof option === "string") return "";
              return option.position
                ? `${option.position} - ${option.full_name}`
                : option.full_name;
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                margin="dense"
                label="Người giải quyết vấn đề"
                fullWidth
                variant="outlined"
              />
            )}
            value={
              responsiblePerson
                ? {
                    full_name: responsiblePerson.includes(" - ")
                      ? responsiblePerson.split(" - ")[1]
                      : responsiblePerson,
                    position: responsiblePerson.includes(" - ")
                      ? responsiblePerson.split(" - ")[0]
                      : "",
                  }
                : null
            }
            onChange={(event, newValue) => {
              setResponsiblePerson(
                newValue
                  ? newValue.position
                    ? `${newValue.position} - ${newValue.full_name}`
                    : newValue.full_name
                  : ""
              );
            }}
            renderOption={(props, option) => (
              <li {...props}>
                {option.position
                  ? `${option.position} - ${option.full_name}`
                  : option.full_name}
              </li>
            )}
            isOptionEqualToValue={(option, value) => {
              if (!option || !value) return false;
              const optionFullName = option.position
                ? `${option.position} - ${option.full_name}`
                : option.full_name;
              return optionFullName === responsiblePerson;
            }}
          />
        </DialogContent>
        <DialogActions>
          {/* <Button onClick={handleCloseEndIssueDialog}>Hủy</Button> */}
          <Button
            onClick={handleConfirmEndIssue}
            fullWidth
            variant="contained"
            disabled={!isFormValid}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {(isLoading || showSuccess) && <div className="overlay" />}

      <Dialog
        open={isLoading && !showSuccess}
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
        open={showSuccess}
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
          <DialogContentText style={{ fontSize: "1.2rem" }}>
            Ghi nhận dữ liệu thành công!
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IssueListPage;
