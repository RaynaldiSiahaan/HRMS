CREATE TABLE face_data (
    username VARCHAR(50) PRIMARY KEY,
    fullName VARCHAR(100) NOT NULL,
    encoding BLOB NOT NULL  -- store binary face encoding data
);
