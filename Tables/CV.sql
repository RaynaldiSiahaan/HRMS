DROP TABLE IF EXISTS cv;

CREATE TABLE cv (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    birth_date DATETIME NOT NULL,
    gender ENUM('Male', 'Female') NOT NULL,
    work_experience_file VARCHAR(255) NOT NULL,
    school_experience_file VARCHAR(255) NOT NULL,
    org_experience_file VARCHAR(255) NOT NULL,
    profile_description_file VARCHAR(255) NOT NULL,
    other_experience_file VARCHAR(255) NOT NULL,
    certificate_file VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


