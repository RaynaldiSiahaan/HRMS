DROP TABLE IF EXISTS employeeperf;

CREATE TABLE employeeperf (
    username VARCHAR(50) PRIMARY KEY,
    fullName VARCHAR(100) NOT NULL,
    Attendance INT DEFAULT 0,
    WorkCompletion DECIMAL(5,2),         -- e.g., 85.50%
    LateCompletion INT,                  -- number of late task completions
    satisfaction_score DECIMAL(3,2),     -- score between 0.00 to 5.00
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
