// src/pages/IssueListPage.js
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
} from "@mui/material";
import Header from "../components/Header";
import IssueFilters from "../components/IssueFilters";
import IssueDetails from "../components/IssueDetails";
import { useNavigate } from "react-router-dom";
import {
  format,
  parse,
  isValid,
  differenceInMinutes,
  setHours,
  setMinutes,
} from "date-fns";
import LoadingAnimation from "../components/LoadingAnimation";
import { fetchIssues, endIssue } from "../data/api";
import AutofillPreventer from "../components/AutofillPreventer";
import Pagination from "../components/Pagination";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import peopleList from "../data/peopleList";
import issueOptions from "../data/issueOptions";
import solutionOptions from "../data/solutionOptions";
import machineryCodes from "../data/machineryCodes";
import ClearIcon from "@mui/icons-material/Clear";

const IssueListPage = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState(null);
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
  const calculateDowntimeMinutes = (startTime, endTime) => {
    const lunchBreakStart = setHours(setMinutes(new Date(startTime), 15), 12);
    const lunchBreakEnd = setHours(setMinutes(new Date(startTime), 15), 13);

    let downtimeMinutes = differenceInMinutes(endTime, startTime);

    if (startTime < lunchBreakEnd && endTime > lunchBreakStart) {
      const breakOverlapStart =
        startTime < lunchBreakStart ? lunchBreakStart : startTime;
      const breakOverlapEnd = endTime > lunchBreakEnd ? lunchBreakEnd : endTime;
      const breakOverlapMinutes = differenceInMinutes(
        breakOverlapEnd,
        breakOverlapStart
      );
      downtimeMinutes -= breakOverlapMinutes;
    }

    return downtimeMinutes;
  };

  useEffect(() => {
    fetchIssuesData();
  }, []);

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

  const fetchIssuesData = async () => {
    setLoading(true);
    try {
      const data = await fetchIssues();
      if (Array.isArray(data)) {
        setIssues(data.filter((issue) => !issue.endTime));
      } else {
        console.error("Received data is not an array:", data);
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterIssues = useCallback(() => {
    let filtered = issues;

    if (searchTerm) {
      filtered = filtered.filter(
        (issue) =>
          issue.lineNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(issue.stationNumber)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          issue.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (issue.responsiblePerson &&
            issue.responsiblePerson
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    if (filterDate) {
      const formattedFilterDate = format(filterDate, "MM/dd/yyyy");
      filtered = filtered.filter((issue) => {
        const issueDate = parse(
          issue.submissionTime,
          "HH:mm MM/dd/yyyy",
          new Date()
        );
        return (
          isValid(issueDate) &&
          format(issueDate, "MM/dd/yyyy") === formattedFilterDate
        );
      });
    }

    setFilteredIssues(filtered);
  }, [issues, searchTerm, filterDate]);

  useEffect(() => {
    filterIssues();
  }, [issues, searchTerm, filterDate, filterIssues]);

  const filterPeopleList = useCallback((lineNumber) => {
    if (!lineNumber) {
      setFilteredPeopleList(["CÔNG NHÂN TỰ XỬ LÝ"]);
      return;
    }

    let filteredList = [];
    let workshopList = [];
    let lineNum = null;

    if (lineNumber === "Line 20.01A" || lineNumber === "Line 20.01B") {
      const teamLeaders = peopleList.teamLeaders.filter((person) =>
        person.includes("TỔ TRƯỞNG TỔ 20.01")
      );
      workshopList = peopleList.workshop2;
      filteredList = [...filteredList, ...teamLeaders, ...workshopList];
    } else if (lineNumber === "Line 20") {
      const teamLeaders = peopleList.teamLeaders.filter((person) =>
        person.includes("TỔ TRƯỞNG TỔ 20 -")
      );
      workshopList = peopleList.workshop2;
      filteredList = [...filteredList, ...teamLeaders, ...workshopList];
    } else {
      lineNum = parseInt(lineNumber.replace("Line ", ""));

      if (lineNum >= 1 && lineNum <= 10) {
        workshopList = peopleList.workshop1;
      } else if (lineNum >= 11 && lineNum <= 20) {
        workshopList = peopleList.workshop2;
      } else if (lineNum >= 21 && lineNum <= 30) {
        workshopList = peopleList.workshop3;
      } else if (
        (lineNum >= 31 && lineNum <= 40) ||
        lineNumber === "Tổ hoàn thành 1 - xưởng 4" ||
        lineNumber === "Tổ hoàn thành 2 - xưởng 4" ||
        lineNumber === "Tổ chi tiết - xưởng 4"
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
            person.includes("TỔ TRƯỞNG TỔ HOÀN THÀNH 2")) ||
          (lineNumber === "Tổ chi tiết - xưởng 4" &&
            person.includes("TỔ TRƯỞNG TỔ CHI TIẾT"))
      );

      filteredList = [...filteredList, ...teamLeaders];
    }

    // Add team vice leaders
    if (lineNum) {
      const teamViceLeaders = peopleList.teamViceLeaders.filter((person) =>
        person.includes(`TỔ PHÓ TỔ ${lineNum.toString().padStart(2, "0")}`)
      );
      filteredList = [...filteredList, ...teamViceLeaders];
    }

    filteredList = [...filteredList, ...workshopList];
    filteredList.push("CÔNG NHÂN TỰ XỬ LÝ");
    setFilteredPeopleList(filteredList);
  }, []);

  const filterIssueOptions = useCallback((scope) => {
    switch (scope) {
      case "Máy móc":
        setFilteredIssueOptions(issueOptions.machinery);
        setCurrentSolutionOptions(solutionOptions.machinery || []);
        break;
      case "Nguyên phụ liệu":
        setFilteredIssueOptions(issueOptions.materials);
        setCurrentSolutionOptions(solutionOptions.materials || []);
        break;
      case "Phương pháp":
        setFilteredIssueOptions(issueOptions.method);
        setCurrentSolutionOptions(solutionOptions.method || []);
        break;
      case "Con người":
        setFilteredIssueOptions(issueOptions.people);
        setCurrentSolutionOptions(solutionOptions.people || []);
        break;
      default:
        setFilteredIssueOptions([]);
        setCurrentSolutionOptions([]);
    }
  }, []);

  useEffect(() => {
    if (selectedIssue) {
      filterPeopleList(selectedIssue.lineNumber);
      filterIssueOptions(selectedIssue.scope);
    }
  }, [selectedIssue, filterPeopleList, filterIssueOptions]);

  const handleEndIssue = (issue) => {
    const currentTime = new Date();
    const formattedEndTime = format(currentTime, "HH:mm MM/dd/yyyy", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
    const startTime = parse(
      issue.submissionTime,
      "HH:mm MM/dd/yyyy",
      new Date()
    );
    const minutesDifference = calculateDowntimeMinutes(startTime, currentTime);

    setSelectedIssue(issue);
    setEndTime(formattedEndTime);
    setDowntimeMinutes(minutesDifference);
    setOpenEndIssueDialog(true);
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
      const finalIssueDescription =
        issueDescription === "Khác" ? `Khác - ${otherIssue}` : issueDescription;
      const finalSolution =
        solution === "Khác" ? `Khác - ${otherSolution}` : solution;
      const result = await endIssue(selectedIssue.id, endTime, {
        downtimeMinutes,
        machineryType: selectedIssue.scope === "Máy móc" ? machineryType : "",
        machineryCode:
          selectedIssue.scope === "Máy móc"
            ? machineryCode
              ? `${machineryCode.value} - ${machineryCode.label}`
              : ""
            : "",
        issue: finalIssueDescription,
        solution: finalSolution,
        problemSolver: responsiblePerson,
        responsiblePerson: selectedIssue.problemSolver, // Giữ nguyên người ghi nhận ban đầu
      });

      if (result.status === "success") {
        setIssues(issues.filter((i) => i.id !== selectedIssue.id));
        setShowSuccess(true);
        handleCloseEndIssueDialog();
        setTimeout(() => {
          setShowSuccess(false);
          setIsLoading(false);
        }, 2000);
      } else {
        throw new Error(result.message || "Failed to update end time");
      }
    } catch (error) {
      console.error("Error ending issue:", error);
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
      filterPeopleList(selectedIssue.lineNumber);
    }
  }, [selectedIssue, filterPeopleList]);

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <AutofillPreventer />
        <Button
          onClick={handleBack}
          variant="outlined"
          style={{ marginBottom: "20px" }}
        >
          Quay lại
        </Button>
        <Typography variant="h4" gutterBottom>
          DANH SÁCH VẤN ĐỀ DOWNTIME
        </Typography>
        {loading ? (
          <LoadingAnimation />
        ) : (
          <>
            <IssueFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterDate={filterDate}
              setFilterDate={setFilterDate}
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
          KẾT THÚC THỜI GIAN DOWNTIME
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
            }}
          />
          {selectedIssue && selectedIssue.scope === "Máy móc" && (
            <>
              <TextField
                select
                label="Chọn loại thiết bị"
                value={machineryType}
                onChange={(e) => setMachineryType(e.target.value)}
                variant="outlined"
                fullWidth
                margin="dense"
              >
                <MenuItem value="Thiết bị may">Thiết bị may</MenuItem>
                <MenuItem value="Thiết bị chuyên dùng">
                  Thiết bị chuyên dùng
                </MenuItem>
                <MenuItem value="Công cụ thiết bị">Công cụ thiết bị</MenuItem>
              </TextField>
              {machineryType && (
                <Autocomplete
                  value={machineryCode}
                  options={machineryCodes[machineryType] || []}
                  getOptionLabel={(option) =>
                    `${option.value} - ${option.label}`
                  }
                  onChange={(e, newValue) => setMachineryCode(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Mã thiết bị"
                      variant="outlined"
                      margin="dense"
                      fullWidth
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>{`${option.value} - ${option.label}`}</li>
                  )}
                />
              )}
            </>
          )}
          <Autocomplete
            options={filteredIssueOptions}
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
              if (newValue !== "Khác") {
                // Reset otherIssue if not "Khác"
                setOtherIssue("");
              }
            }}
          />
          {issueDescription === "Khác" && (
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
            options={currentSolutionOptions}
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
              if (newValue !== "Khác") {
                // Reset otherSolution if not "Khác"
                setOtherSolution("");
              }
            }}
          />
          {solution === "Khác" && (
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
            renderInput={(params) => (
              <TextField
                {...params}
                margin="dense"
                label="Người giải quyết vấn đề"
                fullWidth
                variant="outlined"
                multiline
              />
            )}
            value={responsiblePerson}
            onChange={(event, newValue) => setResponsiblePerson(newValue)}
            renderOption={(props, option) => (
              <li {...props} style={{ whiteSpace: "normal" }}>
                {option}
              </li>
            )}
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
