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
import { format } from "date-fns";

const IssueDetails = ({
  filteredIssues,
  expandedIssue,
  handleExpand,
  handleEndIssue,
  showEndIssueButton = true,
}) => {
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

  const getIssueTitle = (issue) => {
    let title = "";
    if (issue.old_product_code && issue.new_product_code) {
      title += "[CHUYỂN ĐỔI] - ";
    }
    title += `${issue.line_number} - Trạm ${issue.station_number} - Vấn đề: ${issue.scope} - Người ghi nhận: ${issue.responsible_person}`;
    return title;
  };

  return (
    <List>
      {Array.isArray(filteredIssues) &&
        filteredIssues.map((issue) => (
          <Box
            key={issue.id_logged_issue}
            sx={{
              backgroundColor: "transparent",
              borderRadius: "4px",
              mb: 1,
              overflow: "hidden",
            }}
          >
            <ListItem
              button
              onClick={() => handleExpand(issue.id_logged_issue)}
              sx={{
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              <ListItemText
                primary={
                  <React.Fragment>
                    <Typography component="span" display="block">
                      {getIssueTitle(issue)}
                    </Typography>
                    <Typography
                      component="span"
                      display="block"
                      variant="body2"
                      color="text.secondary"
                    >
                      {`Thời gian bắt đầu: ${formatDateTime(
                        issue.submission_time
                      )}`}
                    </Typography>
                  </React.Fragment>
                }
              />
              {expandedIssue === issue.id_logged_issue ? (
                <ExpandLess />
              ) : (
                <ExpandMore />
              )}
            </ListItem>

            <Collapse
              in={expandedIssue === issue.id_logged_issue}
              timeout="auto"
              unmountOnExit
            >
              <List component="div" disablePadding>
                <ListItem
                  sx={{
                    pl: 4,
                    borderLeft: "1px solid #ddd",
                    borderRight: "1px solid #ddd",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  <ListItemText
                    secondary={
                      <React.Fragment>
                        {issue.old_product_code && issue.new_product_code && (
                          <Typography component="div" sx={{ mt: 1 }}>
                            <strong>Mã hàng cũ:</strong> [
                            {issue.old_product_code}] chuyển đổi sang{" "}
                            <strong>Mã hàng mới:</strong> [
                            {issue.new_product_code}]
                          </Typography>
                        )}

                        <Typography component="div" sx={{ mt: 1 }}>
                          <strong>Phạm vi:</strong> {issue.scope}
                        </Typography>

                        {issue.scope === "MÁY MÓC" && (
                          <>
                            <Typography component="div" sx={{ mt: 1 }}>
                              <strong>Loại máy:</strong>{" "}
                              {issue.machinery_type || "Chưa cập nhật"}
                            </Typography>
                            <Typography component="div" sx={{ mt: 1 }}>
                              <strong>Mã:</strong>{" "}
                              {issue.machinery_code || "Chưa cập nhật"}
                            </Typography>
                          </>
                        )}

                        <Typography component="div" sx={{ mt: 1 }}>
                          <strong>Mô tả vấn đề:</strong>{" "}
                          {issue.issue_description || "Chưa cập nhật"}
                        </Typography>

                        <Typography component="div" sx={{ mt: 1 }}>
                          <strong>Thời gian bắt đầu:</strong>{" "}
                          {formatDateTime(issue.submission_time)}
                        </Typography>

                        <Typography component="div" sx={{ mt: 1 }}>
                          <strong>Thời gian kết thúc:</strong>{" "}
                          {issue.end_time
                            ? formatDateTime(issue.end_time)
                            : "Chưa kết thúc"}
                        </Typography>

                        <Typography component="div" sx={{ mt: 1 }}>
                          <strong>Phương án giải quyết:</strong>{" "}
                          {issue.solution_description || "Chưa cập nhật"}
                        </Typography>

                        <Typography component="div" sx={{ mt: 1 }}>
                          <strong>Người giải quyết:</strong>{" "}
                          {issue.problem_solver || "Chưa cập nhật"}
                        </Typography>

                        <Typography component="div" sx={{ mt: 1 }}>
                          <strong>Người ghi nhận:</strong>{" "}
                          {issue.responsible_person}
                        </Typography>

                        {!issue.end_time && showEndIssueButton && (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleEndIssue(issue)}
                            sx={{ mt: 2 }}
                            fullWidth
                          >
                            Kết thúc thời gian Downtime
                          </Button>
                        )}
                      </React.Fragment>
                    }
                  />
                </ListItem>
              </List>
            </Collapse>
          </Box>
        ))}
    </List>
  );
};

export default IssueDetails;
