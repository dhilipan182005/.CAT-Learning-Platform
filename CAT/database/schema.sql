CREATE DATABASE IF NOT EXISTS cat_app;
USE cat_app;

CREATE TABLE users (
id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(50) UNIQUE,
password VARCHAR(100),
role VARCHAR(20),
college VARCHAR(100),
year_passed VARCHAR(10),
course VARCHAR(100),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE simulation_history (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT,
simulation_type VARCHAR(50),
result TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users (username,password,role)
VALUES ('devlpdhilip','dhilip182005kavi','editor');