-- Seed de dados demo para o BizFlow Access
-- Usuário admin: teste@teste.com / 123123
-- Execute: psql -U postgres -h localhost -d salon -f seed-demo.sql

-- 1. USUÁRIO ADMIN
INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'u1',
  'teste@teste.com',
  '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmBhGmLAeGq3F7f7y5XK',
  'Admin',
  'admin',
  NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. SALÃO
INSERT INTO salons (id, "userId", name, phone, email, "pixKey", "createdAt", "updatedAt")
VALUES (
  's1',
  'u1',
  'Graciosa Studio de Beleza',
  '(11) 99999-8888',
  'contato@graciosa.com',
  '11999999999',
  NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. ESPECIALISTAS
INSERT INTO specialists (id, "salonId", name, specialty, status, "createdAt", "updatedAt")
VALUES
  ('sp1', 's1', 'Carlos Silva', 'Corte Masculino e Feminino', 'active', NOW(), NOW()),
  ('sp2', 's1', 'Julia Santos', 'Hidratação e Tratamentos', 'active', NOW(), NOW()),
  ('sp3', 's1', 'Carla Oliveira', 'Manicure e Pedicure', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. HORÁRIOS DOS ESPECIALISTAS (Schedules)
INSERT INTO "specialistSchedules" ("specialistId", "timeSlotDuration", "bufferTime", "allowBookingDaysInAdvance", "minimumNoticeHours", "autoConfirmBookings", "allowOnlineBooking", "workingHours", "customUnavailableDates", "createdAt", "updatedAt")
VALUES
  ('sp1', 30, 0, 30, 2, true, true,
   '[{"dayOfWeek":0,"isWorking":false},{"dayOfWeek":1,"isWorking":true,"startTime":"09:00","endTime":"13:00"},{"dayOfWeek":1,"isWorking":true,"startTime":"14:00","endTime":"18:00"},{"dayOfWeek":2,"isWorking":true,"startTime":"09:00","endTime":"13:00"},{"dayOfWeek":2,"isWorking":true,"startTime":"14:00","endTime":"18:00"},{"dayOfWeek":3,"isWorking":true,"startTime":"09:00","endTime":"13:00"},{"dayOfWeek":3,"isWorking":true,"startTime":"14:00","endTime":"18:00"},{"dayOfWeek":4,"isWorking":true,"startTime":"09:00","endTime":"13:00"},{"dayOfWeek":4,"isWorking":true,"startTime":"14:00","endTime":"18:00"},{"dayOfWeek":5,"isWorking":true,"startTime":"09:00","endTime":"13:00"},{"dayOfWeek":5,"isWorking":true,"startTime":"14:00","endTime":"18:00"},{"dayOfWeek":6,"isWorking":true,"startTime":"09:00","endTime":"13:00"}]',
   '[]', NOW(), NOW()),
  ('sp2', 30, 0, 30, 2, true, true,
   '[{"dayOfWeek":0,"isWorking":false},{"dayOfWeek":1,"isWorking":true,"startTime":"08:00","endTime":"12:00"},{"dayOfWeek":1,"isWorking":true,"startTime":"13:00","endTime":"17:00"},{"dayOfWeek":2,"isWorking":true,"startTime":"08:00","endTime":"12:00"},{"dayOfWeek":2,"isWorking":true,"startTime":"13:00","endTime":"17:00"},{"dayOfWeek":3,"isWorking":true,"startTime":"08:00","endTime":"12:00"},{"dayOfWeek":3,"isWorking":true,"startTime":"13:00","endTime":"17:00"},{"dayOfWeek":4,"isWorking":true,"startTime":"08:00","endTime":"12:00"},{"dayOfWeek":4,"isWorking":true,"startTime":"13:00","endTime":"17:00"},{"dayOfWeek":5,"isWorking":true,"startTime":"08:00","endTime":"12:00"},{"dayOfWeek":5,"isWorking":true,"startTime":"13:00","endTime":"17:00"},{"dayOfWeek":6,"isWorking":true,"startTime":"09:00","endTime":"13:00"}]',
   '[]', NOW(), NOW()),
  ('sp3', 30, 0, 30, 2, true, true,
   '[{"dayOfWeek":0,"isWorking":false},{"dayOfWeek":1,"isWorking":true,"startTime":"10:00","endTime":"13:00"},{"dayOfWeek":1,"isWorking":true,"startTime":"14:00","endTime":"19:00"},{"dayOfWeek":2,"isWorking":true,"startTime":"10:00","endTime":"13:00"},{"dayOfWeek":2,"isWorking":true,"startTime":"14:00","endTime":"19:00"},{"dayOfWeek":3,"isWorking":true,"startTime":"10:00","endTime":"13:00"},{"dayOfWeek":3,"isWorking":true,"startTime":"14:00","endTime":"19:00"},{"dayOfWeek":4,"isWorking":true,"startTime":"10:00","endTime":"13:00"},{"dayOfWeek":4,"isWorking":true,"startTime":"14:00","endTime":"19:00"},{"dayOfWeek":5,"isWorking":true,"startTime":"10:00","endTime":"13:00"},{"dayOfWeek":5,"isWorking":true,"startTime":"14:00","endTime":"19:00"},{"dayOfWeek":6,"isWorking":true,"startTime":"09:00","endTime":"15:00"}]',
   '[]', NOW(), NOW())
ON CONFLICT ("specialistId") DO NOTHING;

-- 5. SERVIÇOS
INSERT INTO services (id, "salonId", name, description, duration, price, status, "createdAt", "updatedAt")
VALUES
  ('sv1', 's1', 'Corte Feminino', 'Corte personalizado com lavagem e finalização', 60, '89.90', 'active', NOW(), NOW()),
  ('sv2', 's1', 'Corte Masculino', 'Corte com máquina e tesoura', 45, '55.00', 'active', NOW(), NOW()),
  ('sv3', 's1', 'Hidratação Capilar', 'Hidratação profunda com queratina', 60, '120.00', 'active', NOW(), NOW()),
  ('sv4', 's1', 'Manicure', 'Esmaltação tradicional ou em gel', 45, '45.00', 'active', NOW(), NOW()),
  ('sv5', 's1', 'Pedicure', 'Cuidados completos com os pés', 45, '55.00', 'active', NOW(), NOW()),
  ('sv6', 's1', 'Escova', 'Escova modelada com finalizador térmico', 40, '65.00', 'active', NOW(), NOW()),
  ('sv7', 's1', 'Coloração', 'Coloração com tinta profissional', 90, '150.00', 'active', NOW(), NOW()),
  ('sv8', 's1', 'Design de Sobrancelhas', 'Design com pinça e henna', 30, '35.00', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 6. CLIENTES
INSERT INTO clients (id, "salonId", name, email, phone, "loyaltyPoints", "createdAt", "updatedAt")
VALUES
  ('c1', 's1', 'Maria Santos', 'maria@email.com', '11911111111', 0, NOW(), NOW()),
  ('c2', 's1', 'Ana Beatriz', 'ana@email.com', '11922222222', 0, NOW(), NOW()),
  ('c3', 's1', 'Paula Costa', 'paula@email.com', '11933333333', 0, NOW(), NOW()),
  ('c4', 's1', 'Fernanda Lima', 'fernanda@email.com', '11944444444', 0, NOW(), NOW()),
  ('c5', 's1', 'Roberta Alves', 'roberta@email.com', '11955555555', 0, NOW(), NOW()),
  ('c6', 's1', 'Juliana Souza', 'juliana@email.com', '11966666666', 0, NOW(), NOW()),
  ('c7', 's1', 'Luciana Pereira', 'luciana@email.com', '11977777777', 0, NOW(), NOW()),
  ('c8', 's1', 'Camila Rocha', 'camila@email.com', '11988888888', 0, NOW(), NOW()),
  ('c9', 's1', 'Patrícia Dias', 'patricia@email.com', '11999999999', 0, NOW(), NOW()),
  ('c10', 's1', 'Amanda Freitas', 'amanda@email.com', '11900000001', 0, NOW(), NOW()),
  ('c11', 's1', 'Beatriz Campos', 'beatriz@email.com', '11900000002', 0, NOW(), NOW()),
  ('c12', 's1', 'Cristina Melo', 'cristina@email.com', '11900000003', 0, NOW(), NOW()),
  ('c13', 's1', 'Daniela Nunes', 'daniela@email.com', '11900000004', 0, NOW(), NOW()),
  ('c14', 's1', 'Elaine Porto', 'elaine@email.com', '11900000005', 0, NOW(), NOW()),
  ('c15', 's1', 'Gabriela Torres', 'gabriela@email.com', '11900000006', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 7. PRODUTOS
INSERT INTO products (id, "salonId", name, stock, "minStock", "sellPrice", "createdAt", "updatedAt")
VALUES
  ('p1', 's1', 'Shampoo Profissional 300ml', 15, 5, '45.90', NOW(), NOW()),
  ('p2', 's1', 'Condicionador Profissional 300ml', 12, 5, '49.90', NOW(), NOW()),
  ('p3', 's1', 'Máscara de Hidratação 250g', 8, 3, '69.90', NOW(), NOW()),
  ('p4', 's1', 'Óleo Capilar Argan 100ml', 6, 3, '89.90', NOW(), NOW()),
  ('p5', 's1', 'Esmalte Vermelho 8ml', 20, 10, '8.90', NOW(), NOW()),
  ('p6', 's1', 'Esmalte Rosa 8ml', 18, 10, '8.90', NOW(), NOW()),
  ('p7', 's1', 'Cera Modeladora 100g', 4, 5, '35.90', NOW(), NOW()),
  ('p8', 's1', 'Pente Profissional', 10, 8, '25.90', NOW(), NOW()),
  ('p9', 's1', 'Escova Redonda 45mm', 5, 3, '55.90', NOW(), NOW()),
  ('p10', 's1', 'Secador Profissional', 2, 1, '299.90', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 8. AGENDAMENTOS (últimos 60 dias)
INSERT INTO appointments (id, "salonId", "clientId", "serviceId", "specialistId", "appointmentDate", "appointmentTime", "appointment_status", "isPublic", "createdAt", "updatedAt")
VALUES
  ('a1', 's1', 'c1', 'sv1', 'sp1', NOW() - INTERVAL '2 days', '09:00', 'completed'::appointment_status, false, NOW(), NOW()),
  ('a2', 's1', 'c2', 'sv3', 'sp2', NOW() - INTERVAL '2 days', '10:00', 'completed'::appointment_status, false, NOW(), NOW()),
  ('a3', 's1', 'c3', 'sv4', 'sp3', NOW() - INTERVAL '1 days', '11:30', 'completed'::appointment_status, false, NOW(), NOW()),
  ('a4', 's1', 'c4', 'sv6', 'sp1', NOW() - INTERVAL '1 days', '14:00', 'completed'::appointment_status, false, NOW(), NOW()),
  ('a5', 's1', 'c5', 'sv5', 'sp3', NOW() - INTERVAL '3 days', '15:30', 'completed'::appointment_status, false, NOW(), NOW()),
  ('a6', 's1', 'c6', 'sv1', 'sp1', NOW() - INTERVAL '4 days', '09:30', 'completed'::appointment_status, false, NOW(), NOW()),
  ('a7', 's1', 'c7', 'sv7', 'sp2', NOW() - INTERVAL '5 days', '10:00', 'completed'::appointment_status, false, NOW(), NOW()),
  ('a8', 's1', 'c8', 'sv8', 'sp3', NOW() - INTERVAL '5 days', '11:00', 'completed'::appointment_status, false, NOW(), NOW()),
  ('a9', 's1', 'c9', 'sv2', 'sp1', NOW() - INTERVAL '7 days', '14:30', 'completed'::appointment_status, false, NOW(), NOW()),
  ('a10', 's1', 'c10', 'sv3', 'sp2', NOW() - INTERVAL '7 days', '16:00', 'completed'::appointment_status, false, NOW(), NOW()),
  -- Hoje
  ('a11', 's1', 'c1', 'sv1', 'sp1', NOW(), '09:00', 'confirmed'::appointment_status, false, NOW(), NOW()),
  ('a12', 's1', 'c2', 'sv4', 'sp3', NOW(), '10:00', 'confirmed'::appointment_status, false, NOW(), NOW()),
  ('a13', 's1', 'c3', 'sv6', 'sp1', NOW(), '11:00', 'pending'::appointment_status, false, NOW(), NOW()),
  ('a14', 's1', 'c4', 'sv3', 'sp2', NOW(), '14:00', 'confirmed'::appointment_status, false, NOW(), NOW()),
  ('a15', 's1', 'c5', 'sv5', 'sp3', NOW(), '15:00', 'confirmed'::appointment_status, false, NOW(), NOW()),
  -- Próximos dias
  ('a16', 's1', 'c6', 'sv1', 'sp1', NOW() + INTERVAL '1 days', '09:30', 'confirmed'::appointment_status, false, NOW(), NOW()),
  ('a17', 's1', 'c7', 'sv4', 'sp3', NOW() + INTERVAL '1 days', '10:30', 'confirmed'::appointment_status, false, NOW(), NOW()),
  ('a18', 's1', 'c8', 'sv7', 'sp2', NOW() + INTERVAL '2 days', '10:00', 'confirmed'::appointment_status, false, NOW(), NOW()),
  ('a19', 's1', 'c9', 'sv2', 'sp1', NOW() + INTERVAL '2 days', '14:00', 'pending'::appointment_status, false, NOW(), NOW()),
  ('a20', 's1', 'c10', 'sv8', 'sp3', NOW() + INTERVAL '3 days', '11:00', 'confirmed'::appointment_status, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 9. TRANSAÇÕES (para agendamentos concluídos)
INSERT INTO transactions (id, "salonId", "appointmentId", "clientId", "serviceId", "specialistId", type, status, "paymentMethod", amount, description, "transactionDate", "createdAt", "updatedAt")
SELECT
  't' || a.id,
  's1',
  a.id,
  a."clientId",
  a."serviceId",
  a."specialistId",
  'income', 'completed',
  CASE (random() * 5)::int
    WHEN 0 THEN 'pix'::payment_method
    WHEN 1 THEN 'cash'::payment_method
    WHEN 2 THEN 'credit_card'::payment_method
    WHEN 3 THEN 'debit_card'::payment_method
    ELSE 'pix'::payment_method
  END,
  s.price::numeric,
  'Pagamento - ' || s.name,
  a."appointmentDate",
  NOW(), NOW()
FROM appointments a
JOIN services s ON s.id = a."serviceId"
WHERE a.appointment_status = 'completed'
ON CONFLICT (id) DO NOTHING;
