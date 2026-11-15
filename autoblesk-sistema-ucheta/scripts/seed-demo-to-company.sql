-- Перенос «чужих» записей с демо (companyId=1) на студию автора
-- и/или копирование демо-наборa на пустую организацию.
--
-- Запуск на VPS (пример):
--   mysql -u USER -p DATABASE < scripts/seed-demo-to-company.sql
--
-- Перед копированием укажите id студии «Авто Блеск»:
SET @TARGET_COMPANY_ID := 0;  -- ОБЯЗАТЕЛЬНО заменить на реальный id из таблицы companies
SET @DEMO_COMPANY_ID := 1;

-- 1) Починить записи, созданные владельцем, но попавшие в демо из-за companyId=1 по умолчанию
UPDATE clients c
INNER JOIN users u ON u.id = c.createdById
SET c.companyId = u.companyId
WHERE c.companyId = @DEMO_COMPANY_ID
  AND u.companyId IS NOT NULL
  AND u.companyId <> @DEMO_COMPANY_ID
  AND u.role <> 'superadmin';

UPDATE orders o
INNER JOIN users u ON u.id = o.createdById
SET o.companyId = u.companyId
WHERE o.companyId = @DEMO_COMPANY_ID
  AND u.companyId IS NOT NULL
  AND u.companyId <> @DEMO_COMPANY_ID
  AND u.role <> 'superadmin';

UPDATE expenses e
INNER JOIN users u ON u.id = e.createdById
SET e.companyId = u.companyId
WHERE e.companyId = @DEMO_COMPANY_ID
  AND u.companyId IS NOT NULL
  AND u.companyId <> @DEMO_COMPANY_ID
  AND u.role <> 'superadmin';

-- 2) Заказы «выполнен», но без postedAt — не видны на главной
UPDATE orders o
INNER JOIN users u ON u.id = o.createdById
SET o.postedAt = COALESCE(o.postedAt, o.createdAt)
WHERE o.companyId = u.companyId
  AND u.companyId = @TARGET_COMPANY_ID
  AND o.status = 'done'
  AND o.postedAt IS NULL;

-- 3) Если у студии нет заказов — скопировать срез демо (только при @TARGET > 1)
--    Выполняется вручную после проверки:
--    SELECT COUNT(*) FROM orders WHERE companyId = @TARGET_COMPANY_ID;

-- Пример копирования 40 последних проведённых демо-заказов (упрощённо, без клиентов):
-- INSERT INTO orders (companyId, car, category, status, services, amount, paymentMethod,
--   createdById, materialCost, materialsSet, postedAt, createdAt)
-- SELECT @TARGET_COMPANY_ID, car, category, status, services, amount, paymentMethod,
--   (SELECT id FROM users WHERE companyId = @TARGET_COMPANY_ID AND role = 'admin' LIMIT 1),
--   materialCost, materialsSet,
--   DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*14) DAY),
--   DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*30) DAY)
-- FROM orders
-- WHERE companyId = @DEMO_COMPANY_ID AND postedAt IS NOT NULL
-- ORDER BY id DESC
-- LIMIT 40;