-- Seed sample events
INSERT INTO events (title, description, event_date, event_end_date, location, is_important, status, published_at, created_at, updated_at)
VALUES
  ('Открит урок по рисуване', '<p>Каним родителите на открит урок по рисуване с децата от подготвителната група.</p>', '2026-04-15 10:00:00+00', '2026-04-15 11:30:00+00', 'Основна зала', true, 'PUBLISHED', NOW(), NOW(), NOW()),
  ('Летен празник 2026', '<p>Празник на приключилата учебна година с игри, танци и забавления.</p>', '2026-06-20 14:00:00+00', '2026-06-20 18:00:00+00', 'Двор на детската градина', true, 'PUBLISHED', NOW(), NOW(), NOW()),
  ('Екскурзия до зоопарка', '<p>Планирана екскурзия до столичния зоопарк за децата от старша група.</p>', '2026-05-10 09:00:00+00', '2026-05-10 16:00:00+00', 'София, Зоологическа градина', false, 'DRAFT', NULL, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Seed sample deadlines
INSERT INTO deadlines (title, description, deadline_date, is_urgent, status, published_at, created_at, updated_at)
VALUES
  ('Краен срок за записване', '<p>Последен ден за подаване на документи за записване в детската градина за учебна 2026/2027 година.</p>', '2026-05-01 23:59:59+00', true, 'PUBLISHED', NOW(), NOW(), NOW()),
  ('Заплащане на месечна такса', '<p>Крайна дата за заплащане на месечната такса за месец април.</p>', '2026-04-05 23:59:59+00', false, 'PUBLISHED', NOW(), NOW(), NOW()),
  ('Медицински прегледи', '<p>Краен срок за предаване на медицински бележки за деца от ясли.</p>', '2026-09-15 23:59:59+00', false, 'DRAFT', NULL, NOW(), NOW())
ON CONFLICT DO NOTHING;
