-- Initialize badges
INSERT INTO badges (name, description, image_url, category, required_points, created_at) VALUES
('Newbie', 'Registered for the first time.', 'https://cdn-icons-png.flaticon.com/512/1378/1378594.png', 'Registration', 0, CURRENT_TIMESTAMP),
('Contributor', 'Donated your first item.', 'https://cdn-icons-png.flaticon.com/512/2787/2787274.png', 'Donation', 100, CURRENT_TIMESTAMP),
('Eco Warrior', 'Donated 10 items.', 'https://cdn-icons-png.flaticon.com/512/2542/2542533.png', 'Donation', 1000, CURRENT_TIMESTAMP),
('Community Collaborator', 'Participated in 5 exchanges.', 'https://cdn-icons-png.flaticon.com/512/745/745154.png', 'Community', 500, CURRENT_TIMESTAMP),
('Community Champ', 'Helped 10 different people through donations.', 'https://cdn-icons-png.flaticon.com/512/4966/4966318.png', 'Community', 1500, CURRENT_TIMESTAMP),
('Philanthropist', 'Donated 100 items.', 'https://cdn-icons-png.flaticon.com/512/3093/3093312.png', 'Donation', 10000, CURRENT_TIMESTAMP),
('Book Lover', 'Donated 20 books.', 'https://cdn-icons-png.flaticon.com/512/2436/2436874.png', 'Books', 2000, CURRENT_TIMESTAMP),
('Green Guardian', 'Saved over 50kg of CO2 emissions.', 'https://cdn-icons-png.flaticon.com/512/7068/7068022.png', 'Environment', 5000, CURRENT_TIMESTAMP); 