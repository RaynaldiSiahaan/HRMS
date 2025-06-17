-- Table 1: employeeper
CREATE TABLE employeeperf (
    username VARCHAR(50) PRIMARY KEY,
    fullName VARCHAR(100) NOT NULL,
    Attendance INT DEFAULT 0,
    WorkCompletion DECIMAL(5,2),  -- e.g. percentage completed like 85.50
    LateCompletion INT,           -- e.g. number of late task completions
    satisfaction_score DECIMAL(3,2)  -- e.g. score between 0.00 to 5.00
);