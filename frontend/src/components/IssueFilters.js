// frontend/src/components/IssueFilters.js
import React from "react";
import { Box, TextField, Button } from "@mui/material";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import moment from "moment-timezone";
import "moment/locale/vi";
import AutofillPreventer from "../components/AutofillPreventer";

const IssueFilters = ({
  searchTerm,
  setSearchTerm,
  filterDate,
  setFilterDate,
}) => {
  const setTodayDate = () => {
    setFilterDate(moment().tz("Asia/Bangkok"));
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
          <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="vi">
            <DatePicker
              label="Lọc theo ngày"
              value={filterDate}
              onChange={(newValue) => {
                if (newValue && newValue.isValid()) {
                  setFilterDate(newValue.tz("Asia/Bangkok"));
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
              inputFormat="DD/MM/YYYY"
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
