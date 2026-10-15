-- Run once on production if `words` was created without an `id` column.
-- Admin and future features expect a stable numeric primary key.

USE lld;

ALTER TABLE words
  ADD COLUMN id INT NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST;
