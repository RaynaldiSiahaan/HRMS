-- Table 3: Attendance
CREATE TABLE Attendance (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    clocked_in_time DATETIME,
    clocked_out_time DATETIME,
   ip_location VARCHAR(45) 
);