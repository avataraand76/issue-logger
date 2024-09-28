// backend/server.js
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const moment = require("moment");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "issue_logger_database",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to database");
});

// Fetch all issues
app.get("/issues", (req, res) => {
  const sql = "SELECT * FROM issues";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching issues:", err);
      return res.status(500).json({ error: "Error fetching issues" });
    }
    res.json(results);
  });
});

// Add new issue
app.post("/issues", (req, res) => {
  console.log(req.body);
  const {
    submissionTime,
    lineNumber,
    stationNumber,
    scope,
    machineryType,
    machineryCode,
    issue,
    solution,
    problemSolver,
    responsiblePerson,
    oldProductCode,
    newProductCode,
    workshop,
  } = req.body;
  const sql =
    "INSERT INTO issues (submissionTime, lineNumber, stationNumber, scope, machineryType, machineryCode, issue, solution, problemSolver, responsiblePerson, oldProductCode, newProductCode, workshop) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [
      submissionTime,
      lineNumber,
      stationNumber,
      scope,
      machineryType,
      machineryCode,
      issue,
      solution,
      problemSolver,
      responsiblePerson,
      oldProductCode,
      newProductCode,
      workshop,
    ],
    (err, result) => {
      if (err) {
        console.error("Error adding issue:", err);
        return res.status(500).json({ error: "Error adding issue" });
      }
      res
        .status(201)
        .json({ id: result.insertId, message: "Issue added successfully" });
    }
  );
});

// End issue
app.put("/issues/:id", (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const {
    endTime,
    machineryType,
    machineryCode,
    issue,
    solution,
    problemSolver,
    submissionTime,
  } = req.body;

  const startTime = moment(submissionTime, "YYYY/MM/DD HH:mm");
  const endTimeMoment = moment(endTime, "YYYY/MM/DD HH:mm");
  const lunchBreakStart = moment(startTime).set({ hour: 12, minute: 15 });
  const lunchBreakEnd = moment(startTime).set({ hour: 13, minute: 15 });

  let calculatedDowntimeMinutes = endTimeMoment.diff(startTime, "minutes");

  if (
    startTime.isBefore(lunchBreakEnd) &&
    endTimeMoment.isAfter(lunchBreakStart)
  ) {
    const breakOverlapStart = moment.max(startTime, lunchBreakStart);
    const breakOverlapEnd = moment.min(endTimeMoment, lunchBreakEnd);
    const breakOverlapMinutes = breakOverlapEnd.diff(
      breakOverlapStart,
      "minutes"
    );
    calculatedDowntimeMinutes -= breakOverlapMinutes;
  }

  const sql =
    "UPDATE issues SET endTime = ?, downtimeMinutes = ?, machineryType = ?, machineryCode = ?, issue = ?, solution = ?, problemSolver = ? WHERE id = ?";
  db.query(
    sql,
    [
      endTime,
      calculatedDowntimeMinutes,
      machineryType,
      machineryCode,
      issue,
      solution,
      problemSolver,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error ending issue:", err);
        return res.status(500).json({ error: "Error ending issue" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Issue not found" });
      }
      res.json({
        message: "Issue ended successfully",
        downtimeMinutes: calculatedDowntimeMinutes,
      });
    }
  );
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
