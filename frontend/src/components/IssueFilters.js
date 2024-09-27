// src/components/IssueFilters.js
import React from "react";
import { Box, TextField, Button } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { isValid } from "date-fns";
import vi from "date-fns/locale/vi";
import AutofillPreventer from "../components/AutofillPreventer";

const IssueFilters = ({
  searchTerm,
  setSearchTerm,
  filterDate,
  setFilterDate,
}) => {
  const setTodayDate = () => {
    setFilterDate(new Date());
  };

  const clearDate = () => {
    setFilterDate(null);
  };

  return (
    <>
      <form autoComplete="off">
        <AutofillPreventer />
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
        <Box mb={2} display="flex" alignItems="center">
          <LocalizationProvider dateAdapter={AdapterDateFns} locale={vi}>
            <DatePicker
              label="Lọc theo ngày"
              value={filterDate}
              onChange={(newValue) => {
                if (isValid(newValue)) {
                  setFilterDate(newValue);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  InputProps={{
                    ...params.InputProps,
                    readOnly: true,
                    autoComplete: "new-password",
                    form: {
                      autoComplete: "off",
                    },
                  }}
                />
              )}
              inputFormat="dd/MM/yyyy"
            />
          </LocalizationProvider>
          <Button
            onClick={setTodayDate}
            variant="contained"
            color="primary"
            style={{ marginLeft: "10px" }}
          >
            Today
          </Button>
          <Button
            onClick={clearDate}
            variant="contained"
            color="secondary"
            style={{ marginLeft: "10px" }}
          >
            Clear
          </Button>
        </Box>
      </form>
    </>
  );
};

export default IssueFilters;
