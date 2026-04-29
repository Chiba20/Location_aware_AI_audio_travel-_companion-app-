CREATE DATABASE IF NOT EXISTS travel_companion
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE travel_companion;

CREATE TABLE IF NOT EXISTS cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  state VARCHAR(120) NOT NULL,
  country VARCHAR(120) NOT NULL,
  tagline VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  hero_image VARCHAR(255),
  offline_available BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cities_name_state_country (name, state, country)
);

CREATE TABLE IF NOT EXISTS interests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS city_interests (
  city_id INT NOT NULL,
  interest_id INT NOT NULL,
  PRIMARY KEY (city_id, interest_id),
  CONSTRAINT fk_city_interests_city
    FOREIGN KEY (city_id) REFERENCES cities(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_city_interests_interest
    FOREIGN KEY (interest_id) REFERENCES interests(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS places (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(100),
  address VARCHAR(255),
  contact VARCHAR(120),
  timings VARCHAR(160),
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  trigger_radius_meters INT NOT NULL DEFAULT 100,
  audio_url VARCHAR(255),
  directions_url VARCHAR(500),
  photos_url VARCHAR(500),
  videos_url VARCHAR(500),
  audio_duration_seconds INT,
  audio_offline_available BOOLEAN NOT NULL DEFAULT FALSE,
  story TEXT NOT NULL,
  did_you_know TEXT,
  is_hidden_gem BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_places_city
    FOREIGN KEY (city_id) REFERENCES cities(id)
    ON DELETE CASCADE,
  INDEX idx_places_city (city_id),
  INDEX idx_places_location (latitude, longitude),
  INDEX idx_places_hidden_gem (is_hidden_gem)
);

CREATE TABLE IF NOT EXISTS place_interests (
  place_id INT NOT NULL,
  interest_id INT NOT NULL,
  PRIMARY KEY (place_id, interest_id),
  CONSTRAINT fk_place_interests_place
    FOREIGN KEY (place_id) REFERENCES places(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_place_interests_interest
    FOREIGN KEY (interest_id) REFERENCES interests(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS walks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  name VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  estimated_minutes INT NOT NULL,
  distance_km DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_walks_city
    FOREIGN KEY (city_id) REFERENCES cities(id)
    ON DELETE CASCADE,
  INDEX idx_walks_city (city_id)
);

CREATE TABLE IF NOT EXISTS walk_places (
  walk_id INT NOT NULL,
  place_id INT NOT NULL,
  sort_order INT NOT NULL,
  PRIMARY KEY (walk_id, place_id),
  CONSTRAINT fk_walk_places_walk
    FOREIGN KEY (walk_id) REFERENCES walks(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_walk_places_place
    FOREIGN KEY (place_id) REFERENCES places(id)
    ON DELETE CASCADE,
  INDEX idx_walk_places_order (walk_id, sort_order)
);

CREATE TABLE IF NOT EXISTS walk_interests (
  walk_id INT NOT NULL,
  interest_id INT NOT NULL,
  PRIMARY KEY (walk_id, interest_id),
  CONSTRAINT fk_walk_interests_walk
    FOREIGN KEY (walk_id) REFERENCES walks(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_walk_interests_interest
    FOREIGN KEY (interest_id) REFERENCES interests(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS journeys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  walk_id INT NULL,
  narration_style VARCHAR(80) NOT NULL DEFAULT 'casual friend',
  offline_mode BOOLEAN NOT NULL DEFAULT FALSE,
  status ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP NULL,
  last_latitude DECIMAL(10, 7) NULL,
  last_longitude DECIMAL(10, 7) NULL,
  last_location_at TIMESTAMP NULL,
  CONSTRAINT fk_journeys_city
    FOREIGN KEY (city_id) REFERENCES cities(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_journeys_walk
    FOREIGN KEY (walk_id) REFERENCES walks(id)
    ON DELETE SET NULL,
  INDEX idx_journeys_city_status (city_id, status),
  INDEX idx_journeys_started_at (started_at)
);

CREATE TABLE IF NOT EXISTS journey_interests (
  journey_id INT NOT NULL,
  interest_id INT NOT NULL,
  PRIMARY KEY (journey_id, interest_id),
  CONSTRAINT fk_journey_interests_journey
    FOREIGN KEY (journey_id) REFERENCES journeys(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_journey_interests_interest
    FOREIGN KEY (interest_id) REFERENCES interests(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS journey_visits (
  journey_id INT NOT NULL,
  place_id INT NOT NULL,
  triggered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  distance_meters DECIMAL(8, 2),
  PRIMARY KEY (journey_id, place_id),
  CONSTRAINT fk_journey_visits_journey
    FOREIGN KEY (journey_id) REFERENCES journeys(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_journey_visits_place
    FOREIGN KEY (place_id) REFERENCES places(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  journey_id INT NULL,
  city_id INT NULL,
  place_id INT NULL,
  rating TINYINT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_feedback_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_feedback_journey
    FOREIGN KEY (journey_id) REFERENCES journeys(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_feedback_city
    FOREIGN KEY (city_id) REFERENCES cities(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_feedback_place
    FOREIGN KEY (place_id) REFERENCES places(id)
    ON DELETE SET NULL,
  INDEX idx_feedback_city (city_id),
  INDEX idx_feedback_place (place_id),
  INDEX idx_feedback_created_at (created_at)
);
