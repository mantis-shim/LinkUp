
INSERT INTO genders (id, name) VALUES (1, 'Vyras'), (2, 'Moteris'), (3, 'Kita')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO categories (id, name) VALUES (1, 'Sportas'), (2, 'Muzika'), (3, 'Edukacija'), (4, 'Socialinis'), (5, 'Žaidimai')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO users (username, password) VALUES 
('jonas', 'jonas'),
('janina', 'janina'),
('bobas', 'bobas')
ON DUPLICATE KEY UPDATE password = VALUES(password);

INSERT INTO activities (id, name, description, location, creator_id, category_id, starts_at, gender_id) VALUES 
(1, 'Rytinis bėgimas', 'Trumpas 5 km bėgimas parke.', 'Vingio parkas', 1, 1, '2026-05-01 08:00:00', 1),
(2, 'Gitaros sesija', 'Muzikos grojimas kartu.', 'Muzikos salė 101', 2, 2, '2026-05-02 18:00:00', 2),
(3, 'Šachmatų turnyras', 'Draugiškos šachmatų partijos visiems lygiams.', 'Biblioteka, B kambarys', 3, 5, '2026-05-03 14:00:00', 3)
ON DUPLICATE KEY UPDATE 
    name = VALUES(name), 
    description = VALUES(description), 
    location = VALUES(location), 
    creator_id = VALUES(creator_id), 
    category_id = VALUES(category_id), 
    starts_at = VALUES(starts_at), 
    gender_id = VALUES(gender_id);

INSERT INTO activity_participants (activity_id, user_id) VALUES 
(1, 1), (1, 2),
(2, 2), (2, 3),
(3, 1), (3, 3)
ON DUPLICATE KEY UPDATE joined_at = VALUES(joined_at);

INSERT INTO conversations (id, name, is_group) VALUES 
(1, 'Bėgikų klubas', TRUE),
(2, NULL, FALSE),
(3, 'Žaidėjų kampelis', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name), is_group = VALUES(is_group);

INSERT INTO conversation_members (conversation_id, user_id) VALUES 
(1, 1), (1, 2),
(2, 1), (2, 3),
(3, 2), (3, 3)
ON DUPLICATE KEY UPDATE joined_at = VALUES(joined_at);

INSERT INTO messages (id, conversation_id, sender_id, content) VALUES 
(1, 1, 1, 'Pasiruošę rytojui?'),
(2, 2, 3, 'Labas, Jonai!'),
(3, 3, 2, 'Kas nors nori pažaisti?')
ON DUPLICATE KEY UPDATE 
    conversation_id = VALUES(conversation_id), 
    sender_id = VALUES(sender_id), 
    content = VALUES(content);

INSERT INTO friendships (user_id, friend_id, status) VALUES 
(1, 2, 'accepted'),
(1, 3, 'pending')
ON DUPLICATE KEY UPDATE status = VALUES(status);