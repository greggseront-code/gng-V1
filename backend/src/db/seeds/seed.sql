-- Seed de développement
-- Crée un gestionnaire et un lecteur pour tester l'application localement.

INSERT OR IGNORE INTO users (email, role) VALUES
  ('admin@ecole.fr', 'gestionnaire'),
  ('lecteur@ecole.fr', 'lecteur');
