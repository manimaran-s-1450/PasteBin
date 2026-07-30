-- ============================================================
-- Database Creation Script for PasteBin Application
-- Database Engine: MySQL 8.0+
-- Character Set: utf8mb4 (Full Unicode / UTF-8 support)
-- ============================================================

-- 1. Create Database if it does not exist
CREATE DATABASE IF NOT EXISTS `pastebin_db`
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- 2. Select Database context
USE `pastebin_db`;

-- 3. Drop Table if exists (for clean re-runs during development)
DROP TABLE IF EXISTS `pastes`;

-- 4. Create Table `pastes`
CREATE TABLE `pastes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `paste_code` VARCHAR(8) NOT NULL,
  `title` VARCHAR(255) DEFAULT NULL,
  `language` VARCHAR(50) NOT NULL DEFAULT 'Plain Text',
  `content` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Primary Key Constraint
  CONSTRAINT `pk_pastes_id` PRIMARY KEY (`id`),
  
  -- Unique Constraint on paste_code for fast O(1) lookup
  CONSTRAINT `uk_pastes_paste_code` UNIQUE (`paste_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores code and text snippet pastes';

-- 5. Additional Secondary Indexes
-- Index on created_at for fast sorting and chronological retrieval
CREATE INDEX `idx_pastes_created_at` ON `pastes` (`created_at` DESC);

-- Index on language for filtering snippets by language
CREATE INDEX `idx_pastes_language` ON `pastes` (`language`);


-- ============================================================
-- 6. Insert Five Sample Records
-- ============================================================

INSERT INTO `pastes` (`paste_code`, `title`, `language`, `content`) VALUES
(
  'A1b2C3d4',
  'Express Hello World Server',
  'JavaScript',
  'const express = require(\'express\');\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.get(\'/\', (req, res) => {\n  res.send(\'Hello World from PasteBin API!\');\n});\n\napp.listen(PORT, () => {\n  console.log(`Server listening on port ${PORT}`);\n});'
),
(
  'e5F6g7H8',
  'Python Quick Sort Implementation',
  'Python',
  'def quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + middle + quicksort(right)\n\nprint(quicksort([3, 6, 8, 10, 1, 2, 1]))'
),
(
  'i9J0k1L2',
  'Responsive Flexbox Layout Template',
  'HTML',
  '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Flexbox Demo</title>\n  <style>\n    .container { display: flex; gap: 1rem; justify-content: center; }\n    .card { padding: 1.5rem; background: #1e1e2e; color: #fff; border-radius: 8px; }\n  </style>\n</head>\n<body>\n  <div class="container">\n    <div class="card">Card 1</div>\n    <div class="card">Card 2</div>\n  </div>\n</body>\n</html>'
),
(
  'm3N4o5P6',
  'MySQL Complex Analytical Query',
  'SQL',
  'SELECT \n    p.language,\n    COUNT(p.id) AS total_pastes,\n    MAX(p.created_at) AS latest_paste_time\nFROM pastes p\nGROUP BY p.language\nORDER BY total_pastes DESC;'
),
(
  'q7R8s9T0',
  'Shopping List & Todo Notes',
  'Plain Text',
  'Project Deliverables for Sprint 1:\n- Complete database schema definition (MySQL 8)\n- Configure connection pool using mysql2 package\n- Implement 8-character unique alphanumeric paste code generator\n- Write unit tests for API routes\n- Complete frontend UI with dark glassmorphism design'
);


-- ============================================================
-- 7. Verification Queries
-- ============================================================

-- Query V1: Verify table structure and columns
DESCRIBE `pastes`;

-- Query V2: Verify index definitions
SHOW INDEX FROM `pastes`;

-- Query V3: Select all records to verify insertion
SELECT `id`, `paste_code`, `title`, `language`, LENGTH(`content`) AS content_length_bytes, `created_at` 
FROM `pastes` 
ORDER BY `created_at` DESC;

-- Query V4: Test retrieval by unique paste code (simulates API GET /api/pastes/:code)
SELECT `title`, `language`, `content`, `created_at` 
FROM `pastes` 
WHERE `paste_code` = 'A1b2C3d4';

-- Query V5: Verify row count
SELECT COUNT(*) AS total_pastes FROM `pastes`;


SHOW INDEX FROM pastes;