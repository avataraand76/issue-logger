// src/components/IssueDetails.js
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
import { format, parse, differenceInMinutes } from "date-fns";

const displayDate = (dateString) => {
  if (!dateString) return "Chưa rõ";
  const date = parse(dateString, "HH:mm MM/dd/yyyy", new Date());
  return format(date, "HH:mm dd/MM/yyyy");
};

const calculateTemporaryDowntime = (startTime) => {
  const start = parse(startTime, "HH:mm MM/dd/yyyy", new Date());
  const now = new Date();
  return differenceInMinutes(now, start);
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
        const temporaryDowntime = !issue.endTime
          ? calculateTemporaryDowntime(issue.submissionTime)
          : null;

        return (
          <Box
            key={issue.id}
            sx={{
              backgroundColor: isSupervisorPage
                ? issue.endTime
                  ? "#e8f5e9"
                  : "#ffebee"
                : "transparent", // Chỉ áp dụng màu nền nếu là trang Supervisor
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
                          {`Thời gian Downtime: ${
                            issue.endTime
                              ? `${issue.downtime} phút`
                              : `${temporaryDowntime} phút (tạm tính)`
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
