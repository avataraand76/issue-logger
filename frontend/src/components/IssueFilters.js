// frontend/src/components/IssueFilters.js
import React from "react";
import { Box, TextField } from "@mui/material";

const IssueFilters = ({ searchTerm, setSearchTerm }) => {
  return (
    <>
      <form autoComplete="off">
        <Box mb={2}>
          <TextField
            label="Tìm kiếm"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            inputProps={{
              autoComplete: "new-password",
              form: {
                autoComplete: "off",
              },
            }}
          />
        </Box>
      </form>
    </>
  );
};

export default IssueFilters;
