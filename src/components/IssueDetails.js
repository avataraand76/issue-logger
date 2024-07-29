// src/components/IssueList.js
import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  Collapse,
  Button,
  Typography,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

const IssueDetails = ({
  filteredIssues,
  expandedIssue,
  handleExpand,
  handleEndIssue,
}) => {
  return (
    <List>
      {filteredIssues.map((issue) => (
        <React.Fragment key={issue.id}>
          <ListItem
            button
            onClick={() => handleExpand(issue.id)}
            sx={{
              border: "1px solid #000",
              borderRadius: "4px",
              mb: 1,
            }}
          >
            <ListItemText
              primary={`${issue.lineNumber} - ${issue.scope} - ${issue.issue}`}
              secondary={`Thời gian bắt đầu: ${issue.submissionTime}`}
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
                  borderRadius: "4px",
                  m: 1,
                  padding: 2,
                  width: "calc(100% - 32px)",
                  boxSizing: "border-box",
                }}
              >
                <ListItemText
                  primary="Thông tin chi tiết"
                  secondary={
                    <React.Fragment>
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
                        Vấn đề: {issue.issue}
                      </Typography>
                      <Typography component="span" display="block">
                        Thời gian bắt đầu: {issue.submissionTime}
                      </Typography>
                      <Typography component="span" display="block">
                        Thời gian kết thúc: {issue.endTime || "Chưa kết thúc"}
                      </Typography>
                      <Typography component="span" display="block">
                        Hành động khắc phục: {issue.remediation || "Chưa có"}
                      </Typography>
                      <Typography component="span" display="block">
                        Người chịu trách nhiệm:{" "}
                        {issue.responsiblePerson || "Chưa xác định"}
                      </Typography>
                      {!issue.endTime && (
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
        </React.Fragment>
      ))}
    </List>
  );
};

export default IssueDetails;
