// backend/server.js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const moment = require("moment-timezone");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const { format } = require("date-fns");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10, // Số lượng connection tối đa
  waitForConnections: true, // Queue queries when no connections available
  queueLimit: 0, // Unlimited queue size
  connectTimeout: 60000, // 60 seconds
  enableKeepAlive: true, // Thêm keepAlive
  keepAliveInitialDelay: 0, // Bắt đầu keepAlive ngay lập tức
  multipleStatements: true, // Cho phép nhiều câu lệnh SQL
});

// API endpoint để lấy danh sách issues
app.get("/api/issues", async (req, res) => {
  try {
    const [rows] = await pool.promise().query(`
      SELECT 
        i.id_logged_issue,
        i.submission_time,
        i.line_number,
        i.station_number,
        c.name_category as scope,
        i.id_category,
        i.responsible_person,
        i.old_product_code,
        i.new_product_code,
        i.workshop,
        i.status_logged_issue,
        i.end_time,
        i.machinery_type,
        i.machinery_code,
        i.issue_description,
        i.solution_description,
        i.problem_solver,
        i.downtime_minutes
      FROM tb_logged_issue i
      LEFT JOIN tb_category c ON i.id_category = c.id_category
      ORDER BY i.id_logged_issue DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

// API endpoint để thêm issue mới
app.post("/api/issues", async (req, res) => {
  try {
    const {
      submissionTime,
      lineNumber,
      stationNumber,
      id_category,
      responsiblePerson,
      oldProductCode,
      newProductCode,
      status_logged_issue = "pending",
    } = req.body;

    // Get line information to determine workshop and factory
    const [lineResult] = await pool
      .promise()
      .query(`SELECT id_workshop FROM tb_line WHERE name_line = ?`, [
        lineNumber,
      ]);

    if (!lineResult || lineResult.length === 0) {
      throw new Error("Line not found");
    }

    const id_workshop = lineResult[0].id_workshop;

    // Determine workshop based on id_workshop
    let workshop;
    switch (id_workshop) {
      case 1:
        workshop = "XƯỞNG 1";
        break;
      case 2:
        workshop = "XƯỞNG 2";
        break;
      case 3:
        workshop = "XƯỞNG 3";
        break;
      case 4:
        workshop = "XƯỞNG 4";
        break;
      default:
        throw new Error("Invalid workshop ID");
    }

    // Determine factory based on id_workshop
    const factory = id_workshop === 4 ? "XÍ NGHIỆP 2" : "XÍ NGHIỆP 1";

    // Insert into database
    const [result] = await pool.promise().query(
      `INSERT INTO tb_logged_issue (
        submission_time,
        line_number,
        station_number,
        id_category,
        responsible_person,
        old_product_code,
        new_product_code,
        workshop,
        factory,
        status_logged_issue
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        submissionTime,
        lineNumber,
        stationNumber,
        id_category,
        responsiblePerson,
        oldProductCode || null,
        newProductCode || null,
        workshop,
        factory,
        status_logged_issue,
      ]
    );

    res.json({ status: "success", id: result.insertId });
  } catch (error) {
    console.error("Error adding issue:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

// API endpoint để kết thúc issue
app.post("/api/issues/:id/end", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      endTime,
      machineryType,
      machineryCode,
      issueDescription,
      solutionDescription,
      problemSolver,
      downtimeMinutes,
    } = req.body;

    // Update database
    await pool.promise().query(
      `UPDATE tb_logged_issue SET 
        end_time = STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s'),
        machinery_type = ?,
        machinery_code = ?,
        issue_description = ?,
        solution_description = ?,
        problem_solver = ?,
        downtime_minutes = ?,
        status_logged_issue = 'resolved'
      WHERE id_logged_issue = ?`,
      [
        endTime,
        machineryType || null,
        machineryCode || null,
        issueDescription,
        solutionDescription,
        problemSolver,
        downtimeMinutes,
        id,
      ]
    );

    // Get full issue data for Google Sheets
    const [issueData] = await pool.promise().query(
      `SELECT 
        i.*,
        c.name_category as scope
      FROM tb_logged_issue i
      LEFT JOIN tb_category c ON i.id_category = c.id_category
      WHERE i.id_logged_issue = ?`,
      [id]
    );

    if (issueData[0]) {
      // Append to Google Sheets with complete data
      await appendToGoogleSheet({
        submission_time: format(
          new Date(issueData[0].submission_time),
          "HH:mm MM/dd/yyyy"
        ),
        line_number: issueData[0].line_number,
        station_number: issueData[0].station_number,
        scope: issueData[0].scope,
        machinery_type: machineryType,
        machinery_code: machineryCode,
        issue_description: issueDescription,
        solution_description: solutionDescription,
        problem_solver: problemSolver,
        responsible_person: issueData[0].responsible_person,
        end_time: format(new Date(issueData[0].end_time), "HH:mm MM/dd/yyyy"),
        downtime_minutes: downtimeMinutes,
        old_product_code: issueData[0].old_product_code,
        new_product_code: issueData[0].new_product_code,
        workshop: issueData[0].workshop,
        factory: issueData[0].factory,
      });
    }

    res.json({ status: "success" });
  } catch (error) {
    console.error("Error ending issue:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
});

// Get issues by category
app.get("/api/issues-by-category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const [rows] = await pool.promise().query(
      `SELECT id_issue, name_issue 
       FROM tb_issue 
       WHERE id_category = ?
       ORDER BY id_issue ASC`,
      [categoryId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching issues:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get solutions by category
app.get("/api/solutions-by-category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const [rows] = await pool.promise().query(
      `SELECT id_solution, name_solution 
       FROM tb_solution 
       WHERE id_category = ?
       ORDER BY id_solution ASC`,
      [categoryId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching solutions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get machinery categories
app.get("/api/machinery-categories", async (req, res) => {
  try {
    const [rows] = await pool.promise().query(
      `SELECT id_machinery_category, name_machinery_category 
       FROM tb_machinery_category 
       ORDER BY id_machinery_category ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching machinery categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get machinery by category
app.get("/api/machinery/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const [rows] = await pool.promise().query(
      `SELECT id_machinery, code_machinery, name_machinery 
       FROM tb_machinery 
       WHERE id_machinery_category = ?
       ORDER BY code_machinery ASC`,
      [categoryId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching machinery:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Sửa lại API endpoint để lấy danh sách nhân viên
app.get("/api/employees/:workshopId", async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { lineNumber } = req.query;

    // Lấy id_line và id_workshop từ tb_line
    const [lineResult] = await pool
      .promise()
      .query(`SELECT id_line, id_workshop FROM tb_line WHERE name_line = ?`, [
        lineNumber,
      ]);

    const lineId = lineResult[0]?.id_line;
    const lineWorkshopId = lineResult[0]?.id_workshop;

    // Query riêng cho tổ trưởng, tổ phó và nhân viên kỹ thuật
    const query = `
      SELECT 
        e.id_employee,
        e.full_name,
        e.position,
        eg.name_employee_group
      FROM tb_employee e
      LEFT JOIN tb_employee_group eg ON e.id_employee_group = eg.id_employee_group
      WHERE (
        /* Tổ trưởng và tổ phó của line cụ thể */
        (e.id_line = ? AND (e.position LIKE '%TỔ TRƯỞNG%' OR e.position LIKE '%TỔ PHÓ%'))
        OR
        /* Nhân viên thuộc nhóm 5 và 6 của workshop */
        (e.id_workshop = ? AND e.id_employee_group IN (5, 6))
      )
      ORDER BY 
        CASE 
          WHEN e.position LIKE '%TỔ TRƯỞNG%' THEN 1
          WHEN e.position LIKE '%TỔ PHÓ%' THEN 2
          WHEN eg.name_employee_group = 'CƠ ĐIỆN' THEN 3
          WHEN eg.name_employee_group = 'KỸ THUẬT' THEN 4
          ELSE 5
        END,
        e.id_employee ASC
    `;

    const [rows] = await pool.promise().query(query, [lineId, lineWorkshopId]);

    res.json(rows);
  } catch (error) {
    console.error("Error in /api/employees:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Thêm API endpoint để lấy danh sách line
app.get("/api/lines", async (req, res) => {
  try {
    const [rows] = await pool.promise().query(`
      SELECT 
        l.id_line,
        l.name_line,
        l.id_workshop
      FROM tb_line l
      ORDER BY l.id_line ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching lines:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

// Handle database connection errors
pool.on("error", (err) => {
  console.error("Database error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.error("Database connection was closed.");
  }
  if (err.code === "ER_CON_COUNT_ERROR") {
    console.error("Database has too many connections.");
  }
  if (err.code === "ECONNREFUSED") {
    console.error("Database connection was refused.");
  }
});

// Add this function to handle Google Sheets operations
async function appendToGoogleSheet(data) {
  try {
    // Parse the service account credentials
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

    // Create JWT client
    const serviceAccountAuth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // Create new document instance
    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID,
      serviceAccountAuth
    );

    // Load document properties and sheets
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0]; // Assumes first sheet

    // Format the row data
    const rowData = {
      "THỜI GIAN BẮT ĐẦU": data.submission_time,
      "SỐ CHUYỀN": data.line_number,
      TRẠM: data.station_number,
      "PHẠM VI VẤN ĐỀ": data.scope,
      "LOẠI MÁY": data.machinery_type || "",
      "MÃ THIẾT BỊ": data.machinery_code || "",
      "MÔ TẢ VẤN ĐỀ": data.issue_description || "",
      "PHƯƠNG ÁN GIẢI QUYẾT": data.solution_description || "",
      "NGƯỜI GIẢI QUYẾT VẤN ĐỀ": data.problem_solver || "",
      "NGƯỜI GHI NHẬN VẤN ĐỀ": data.responsible_person,
      "THỜI GIAN KẾT THÚC DOWNTIME": data.end_time || "",
      "THỜI GIAN (PHÚT) DOWNTIME": data.downtime_minutes ?? 0,
      "MÃ HÀNG CŨ": data.old_product_code || "",
      "MÃ HÀNG MỚI": data.new_product_code || "",
      XƯỞNG: data.workshop,
      "XÍ NGHIỆP": data.factory,
    };

    await sheet.addRow(rowData);
  } catch (error) {
    console.error("Error appending to Google Sheet:", error);
    throw error;
  }
}
