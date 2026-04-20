CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT NOW()
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
);

CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    image_src TEXT,
    creator_id INT NOT NULL REFERENCES users(id),
    category_id INT NOT NULL REFERENCES categories(id), -- Many to Many?
    created_at DATETIME DEFAULT NOW(),
    starts_at DATETIME,
    gender_id INT REFERENCES genders(id)
);

CREATE TABLE activity_participants(
    activity_id INT NOT NULL REFERENCES activities(id),
    user_id INT NOT NULL REFERENCES users(id),
    joined_at DATETIME DEFAULT NOW(),
    PRIMARY KEY (activity_id, user_id)
);

CREATE TABLE activity_rejections(
    activity_id INT NOT NULL REFERENCES activities(id),
    user_id INT NOT NULL REFERENCES users(id),
    rejected_at DATETIME DEFAULT NOW(),
    PRIMARY KEY (activity_id, user_id)
);

CREATE TABLE converstaions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100), -- NULL FOR DIRECT MESSAGES
    is_group BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME DEFAULT NOW()
);

CREATE TABLE conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    is_group BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME DEFAULT NOW()
);

CREATE TABLE conversation_members (
    conversation_id INT NOT NULL REFERENCES conversations(id),
    user_id INT NOT NULL REFERENCES users(id),
    joined_at DATETIME DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL REFERENCES convesations(id),
    sender_id INT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    sent_at DATETIME DEFAULT NOW()
);

-- Friends
CREATE TABLE friendships (
    user_id INT NOT NULL REFERENCES users(id),
    friend_id INT NOT NULL REFERENCES users(id),
    status ENUM('pending', 'accepted') DEFAULT 'pending',
    created_at DATETIME DEFAULT NOW(),
    PRIMARY KEY (user_id, friend_id)
);