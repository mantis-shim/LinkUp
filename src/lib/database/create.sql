CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    expires_at DATETIME NOT NULL
);

CREATE TABLE genders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL
);
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
    --description?
);

CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    creator_id INT NOT NULL REFERENCES users(id),
    category_id INT NOT NULL REFERENCES categories(id), -- Many to Many?
    gender_id INT REFENCES genders(id),
);

CREATE TABLE activity_participants(
    activity_id INT NOT NULL REFERENCES activities(id),
    user_id INT NOT NULL REFERENCES users(id),
    joined_at DATETIME DEFAULT NOW(),
    PRIMARY KEY (activity_id, participant_id)
);