// frontend/src/components/IssueDetails.js
import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  Collapse,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import moment from "moment-timezone";

const displayDate = (dateString) => {
  if (!dateString) return "Chưa rõ";
  try {
    const date = moment.tz(dateString, "Asia/Bangkok");
    if (!date.isValid()) {
      console.error(`Invalid date string: ${dateString}`);
      return "Ngày không hợp lệ";
    }
    return date.format("HH:mm DD/MM/YYYY");
  } catch (error) {
    console.error(`Error parsing date: ${dateString}`, error);
    return "Lỗi định dạng ngày";
  }
};

const calculateDowntimeMinutes = (startTime, endTime) => {
  const start = moment.tz(startTime, "Asia/Bangkok");
  const end = moment.tz(endTime, "Asia/Bangkok");

  if (!start.isValid() || !end.isValid()) {
    console.error("Invalid start or end time");
    return 0;
  }

  if (end.isBefore(start)) {
    console.error("End time is before start time");
    return 0;
  }

  const lunchBreakStart = moment(start)
    .tz("Asia/Bangkok")
    .set({ hour: 12, minute: 15 });
  const lunchBreakEnd = moment(start)
    .tz("Asia/Bangkok")
    .set({ hour: 13, minute: 15 });

  let downtimeMinutes = end.diff(start, "minutes");

  if (start.isBefore(lunchBreakEnd) && end.isAfter(lunchBreakStart)) {
    const breakOverlapStart = moment.max(start, lunchBreakStart);
    const breakOverlapEnd = moment.min(end, lunchBreakEnd);
    const breakOverlapMinutes = breakOverlapEnd.diff(
      breakOverlapStart,
      "minutes"
    );
    downtimeMinutes -= breakOverlapMinutes;
  }

  return downtimeMinutes;
};

const IssueDetails = ({
  filteredIssues,
  expandedIssue,
  handleExpand,
  handleEndIssue,
  showEndIssueButton = true,
  isSupervisorPage = false,
}) => {
  return (
    <List>
      {filteredIssues.map((issue) => {
        const downtimeMinutes = calculateDowntimeMinutes(
          issue.submissionTime,
          issue.endTime
        );

        return (
          <Box
            key={issue.id}
            sx={{
              backgroundColor: isSupervisorPage
                ? issue.endTime
                  ? "#e8f5e9"
                  : "#ffebee"
                : "transparent",
              borderRadius: "4px",
              mb: 1,
              overflow: "hidden",
            }}
          >
            <ListItem
              button
              onClick={() => handleExpand(issue.id)}
              sx={{
                border: "1px solid #000",
                borderRadius: "4px",
              }}
            >
              <ListItemText
                primary={
                  <React.Fragment>
                    <Typography component="span" display="block">
                      {`${
                        issue.oldProductCode && issue.newProductCode
                          ? "[CHUYỂN ĐỔI] - "
                          : ""
                      }${issue.lineNumber} - Trạm ${
                        issue.stationNumber
                      } - Vấn đề: ${issue.scope} - Người ghi nhận: ${
                        issue.responsiblePerson
                      }`}
                    </Typography>
                    <Typography
                      component="span"
                      display="block"
                      variant="body2"
                    >
                      {`Thời gian bắt đầu: ${displayDate(
                        issue.submissionTime
                      )}`}
                    </Typography>
                    {isSupervisorPage && (
                      <React.Fragment>
                        <Typography
                          component="span"
                          display="block"
                          variant="body2"
                        >
                          {`Thời gian kết thúc: ${displayDate(issue.endTime)}`}
                        </Typography>
                        <Typography
                          component="span"
                          display="block"
                          variant="body2"
                        >
                          {`Thời gian Downtime: ${downtimeMinutes} phút ${
                            issue.endTime ? "" : "(tạm tính)"
                          }`}
                        </Typography>
                      </React.Fragment>
                    )}
                  </React.Fragment>
                }
              />
              {expandedIssue === issue.id ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse
              in={expandedIssue === issue.id}
              timeout="auto"
              unmountOnExit
            >
              <List component="div" disablePadding>
                <ListItem
                  sx={{
                    border: "1px solid #000",
                    borderTop: "none",
                    padding: 2,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <ListItemText
                    primary="Thông tin chi tiết"
                    secondary={
                      <React.Fragment>
                        {issue.oldProductCode && issue.newProductCode && (
                          <Typography component="span" display="block">
                            Mã hàng cũ: [{issue.oldProductCode}] chuyển đổi sang
                            Mã hàng mới: [{issue.newProductCode}]
                          </Typography>
                        )}
                        <Typography component="span" display="block">
                          Phạm vi: {issue.scope}
                        </Typography>
                        {issue.scope === "Máy móc" && (
                          <>
                            <Typography component="span" display="block">
                              Loại máy: {issue.machineryType}
                            </Typography>
                            <Typography component="span" display="block">
                              Mã: {issue.code}
                            </Typography>
                          </>
                        )}
                        <Typography component="span" display="block">
                          Mô tả vấn đề: {issue.issue || "Chưa xác định"}
                        </Typography>
                        <Typography component="span" display="block">
                          Thời gian bắt đầu: {displayDate(issue.submissionTime)}
                        </Typography>
                        <Typography component="span" display="block">
                          Thời gian kết thúc: {displayDate(issue.endTime)}
                        </Typography>
                        <Typography component="span" display="block">
                          Phương án giải quyết: {issue.solution || "Chưa có"}
                        </Typography>
                        <Typography component="span" display="block">
                          Người giải quyết:{" "}
                          {issue.problemSolver || "Chưa xác định"}
                        </Typography>
                        <Typography component="span" display="block">
                          Người ghi nhận:{" "}
                          {issue.responsiblePerson || "Chưa xác định"}
                        </Typography>
                        {!issue.endTime && showEndIssueButton && (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleEndIssue(issue)}
                            sx={{ mt: 2 }}
                          >
                            KẾT THÚC THỜI GIAN DOWNTIME
                          </Button>
                        )}
                      </React.Fragment>
                    }
                  />
                </ListItem>
              </List>
            </Collapse>
          </Box>
        );
      })}
    </List>
  );
};

export default IssueDetails;
