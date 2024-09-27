// src/components/Pagination.js
import React from "react";
import { Box, Button, Typography } from "@mui/material";

const Pagination = ({ issuesPerPage, totalIssues, paginate, currentPage }) => {
  const pageNumbers = [];
  const totalPages = Math.ceil(totalIssues / issuesPerPage);

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Typography variant="body2">
        Trang {currentPage} / {totalPages}
      </Typography>
      <Box>
        <Button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outlined"
          size="small"
          style={{ marginRight: "5px" }}
        >
          Trước
        </Button>
        <Button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="outlined"
          size="small"
        >
          Sau
        </Button>
      </Box>
    </Box>
  );
};

export default Pagination;
