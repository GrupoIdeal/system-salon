BEGIN;

-- Preenche users.salonId com o id do salão cujo userId aponta para o usuário (associa proprietários)
UPDATE users
SET salonId = s.id
FROM salons s
WHERE s.userId = users.id
  AND (users.salonId IS NULL OR users.salonId = '');

COMMIT;
