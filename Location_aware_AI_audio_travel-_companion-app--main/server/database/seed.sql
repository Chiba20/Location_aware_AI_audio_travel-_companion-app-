USE travel_companion;

INSERT INTO cities
  (id, name, state, country, tagline, description, hero_image, offline_available)
VALUES
  (1, 'Kanchipuram', 'Tamil Nadu', 'India', 'City of thousand temples',
   'Kanchipuram is known for ancient temples, silk weaving streets, sacred architecture, and layered cultural history.',
   'kanchipuram.jpg', TRUE),
  (2, 'Madurai', 'Tamil Nadu', 'India', 'Ancient city of stories',
   'Madurai blends temple heritage, food streets, markets, and living traditions around the Meenakshi Amman Temple.',
   'madurai.jpg', TRUE)
ON DUPLICATE KEY UPDATE
  tagline = VALUES(tagline),
  description = VALUES(description),
  hero_image = VALUES(hero_image),
  offline_available = VALUES(offline_available);

INSERT INTO interests (id, name)
VALUES
  (1, 'history'),
  (2, 'architecture'),
  (3, 'spirituality'),
  (4, 'silk'),
  (5, 'hidden gems'),
  (6, 'food'),
  (7, 'markets'),
  (8, 'culture')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT IGNORE INTO city_interests (city_id, interest_id)
VALUES
  (1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
  (2, 1), (2, 2), (2, 6), (2, 7), (2, 8);

INSERT INTO places
  (id, city_id, name, latitude, longitude, trigger_radius_meters, audio_url,
   audio_duration_seconds, audio_offline_available, story, did_you_know, is_hidden_gem)
VALUES
  (1, 1, 'Ekambareswarar Temple', 12.8476000, 79.6992000, 120,
   '/audio/kanchipuram/ekambareswarar.mp3', 165, TRUE,
   'A sacred site associated with the element earth, Ekambareswarar Temple turns stone, ritual, and legend into a living map of Kanchipuram.',
   'The temple complex is known for a mango tree connected to local legend.', FALSE),
  (2, 1, 'Kanchipuram Silk Weaver Street', 12.8352000, 79.7036000, 100,
   '/audio/kanchipuram/silk-weavers.mp3', 140, TRUE,
   'Here the city speaks through looms, dyed silk threads, family workshops, and the patient craft behind Kanchipuram sarees.',
   'Traditional silk sarees can take several days or weeks depending on design complexity.', TRUE),
  (3, 2, 'Meenakshi Amman Temple', 9.9195000, 78.1193000, 140,
   '/audio/madurai/meenakshi.mp3', 180, TRUE,
   'Meenakshi Amman Temple anchors Madurai with towering gopurams, ritual movement, and a city rhythm shaped by devotion and trade.',
   'The temple is one of the strongest visual symbols of Tamil temple architecture.', FALSE),
  (4, 2, 'Madurai Food Street', 9.9150000, 78.1219000, 110,
   '/audio/madurai/food-street.mp3', 130, TRUE,
   'This walk follows the smell of jigarthanda, hot snacks, and late-night food culture that keeps Madurai awake.',
   'Madurai''s food streets are often busiest after sunset.', TRUE)
ON DUPLICATE KEY UPDATE
  city_id = VALUES(city_id),
  name = VALUES(name),
  latitude = VALUES(latitude),
  longitude = VALUES(longitude),
  trigger_radius_meters = VALUES(trigger_radius_meters),
  audio_url = VALUES(audio_url),
  audio_duration_seconds = VALUES(audio_duration_seconds),
  audio_offline_available = VALUES(audio_offline_available),
  story = VALUES(story),
  did_you_know = VALUES(did_you_know),
  is_hidden_gem = VALUES(is_hidden_gem);

INSERT IGNORE INTO place_interests (place_id, interest_id)
VALUES
  (1, 1), (1, 2), (1, 3),
  (2, 4), (2, 8), (2, 5),
  (3, 1), (3, 2), (3, 8),
  (4, 6), (4, 7), (4, 8);

INSERT INTO walks
  (id, city_id, name, description, estimated_minutes, distance_km)
VALUES
  (1, 1, 'Temple and Silk Walk',
   'A light walking route that blends temple heritage with Kanchipuram''s weaving culture.',
   45, 2.40),
  (2, 2, 'Madurai Culture Walk',
   'A compact route from temple stories to food street energy.',
   50, 2.10)
ON DUPLICATE KEY UPDATE
  city_id = VALUES(city_id),
  name = VALUES(name),
  description = VALUES(description),
  estimated_minutes = VALUES(estimated_minutes),
  distance_km = VALUES(distance_km);

INSERT IGNORE INTO walk_places (walk_id, place_id, sort_order)
VALUES
  (1, 1, 1),
  (1, 2, 2),
  (2, 3, 1),
  (2, 4, 2);

INSERT IGNORE INTO walk_interests (walk_id, interest_id)
VALUES
  (1, 1), (1, 2), (1, 4), (1, 5),
  (2, 1), (2, 6), (2, 8);
