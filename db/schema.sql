CREATE DATABASE IF NOT EXISTS lld CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lld;

CREATE TABLE IF NOT EXISTS usrs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  sp_easy INT NOT NULL DEFAULT 0,
  sp_med INT NOT NULL DEFAULT 0,
  sp_hard INT NOT NULL DEFAULT 0,
  kr_easy INT NOT NULL DEFAULT 0,
  kr_med INT NOT NULL DEFAULT 0,
  kr_hard INT NOT NULL DEFAULT 0,
  zh_easy INT NOT NULL DEFAULT 0,
  zh_med INT NOT NULL DEFAULT 0,
  zh_hard INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS words (
  id INT AUTO_INCREMENT PRIMARY KEY,
  english VARCHAR(255) NOT NULL,
  diff VARCHAR(10),
  freq FLOAT,
  pronunciation VARCHAR(255),
  spanish VARCHAR(255),
  korean VARCHAR(255),
  chinese VARCHAR(255),
  pinyin VARCHAR(255),
  def TEXT
);

CREATE TABLE IF NOT EXISTS dict (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  term VARCHAR(255) NOT NULL,
  `define` TEXT,
  sentence TEXT,
  lang VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS diaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  entry TEXT,
  date VARCHAR(64) NOT NULL,
  UNIQUE KEY user_date (username, date)
);

CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  diaryId INT NOT NULL,
  username VARCHAR(255) NOT NULL,
  date VARCHAR(64) NOT NULL,
  tag VARCHAR(255) NOT NULL,
  FOREIGN KEY (diaryId) REFERENCES diaries(id) ON DELETE CASCADE
);

-- Sample words so the home page and game work without running data_dump.ts
INSERT INTO words (english, diff, freq, pronunciation, spanish, korean, chinese, pinyin, def)
SELECT * FROM (
  SELECT 'water' AS english, 'easy' AS diff, 5.9 AS freq, 'ˈwɔtər' AS pronunciation, 'el agua' AS spanish, '물' AS korean, '水' AS chinese, 'shuǐ' AS pinyin, 'a clear liquid that forms rain, rivers, and seas' AS def UNION ALL
  SELECT 'house', 'easy', 5.7, 'haʊs', 'la casa', '집', '房子', 'fáng zi', 'a building where people live' UNION ALL
  SELECT 'book', 'easy', 5.6, 'bʊk', 'el libro', '책', '书', 'shū', 'a written work bound between covers' UNION ALL
  SELECT 'friend', 'easy', 5.5, 'frɛnd', 'el amigo', '친구', '朋友', 'péng you', 'a person you know well and like' UNION ALL
  SELECT 'dog', 'easy', 5.4, 'dɔɡ', 'el perro', '개', '狗', 'gǒu', 'a domesticated animal kept as a pet' UNION ALL
  SELECT 'journey', 'med', 4.5, 'ˈdʒɜrni', 'el viaje', '여행', '旅程', 'lǚ chéng', 'the act of traveling from one place to another' UNION ALL
  SELECT 'weather', 'med', 4.6, 'ˈwɛðər', 'el tiempo', '날씨', '天气', 'tiān qì', 'the state of the atmosphere at a place and time' UNION ALL
  SELECT 'kitchen', 'med', 4.4, 'ˈkɪtʃən', 'la cocina', '부엌', '厨房', 'chú fáng', 'a room where food is prepared and cooked' UNION ALL
  SELECT 'mirror', 'med', 4.2, 'ˈmɪrər', 'el espejo', '거울', '镜子', 'jìng zi', 'a reflective surface that shows an image' UNION ALL
  SELECT 'ladder', 'hard', 3.5, 'ˈlædər', 'la escalera', '사다리', '梯子', 'tī zi', 'a structure of rungs used for climbing' UNION ALL
  SELECT 'harvest', 'hard', 3.6, 'ˈhɑrvəst', 'la cosecha', '수확', '收获', 'shōu huò', 'the gathering of a ripened crop' UNION ALL
  SELECT 'lantern', 'hard', 3.1, 'ˈlæntərn', 'la linterna', '등불', '灯笼', 'dēng long', 'a portable light with a protective case' UNION ALL
  SELECT 'thimble', 'hard', 2.8, 'ˈθɪmbəl', 'el dedal', '골무', '顶针', 'dǐng zhēn', 'a small cap worn to protect a finger while sewing'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM words);
