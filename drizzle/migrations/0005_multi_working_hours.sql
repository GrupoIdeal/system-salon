-- Migração para transformar workingHours e workingDays em arrays por dia
-- Atualiza todos os salões e especialistas existentes para o novo formato

-- Salão: transforma { segunda: { start, end, ... } } em { segunda: [{ start, end, ... }] }
DO $$
DECLARE
    r RECORD;
    new_wh JSONB;
BEGIN
    FOR r IN SELECT id, "workingHours" FROM salons LOOP
        new_wh := (
            SELECT jsonb_object_agg(key, jsonb_build_array(value))
            FROM jsonb_each(r."workingHours")
        );
        UPDATE salons SET "workingHours" = new_wh WHERE id = r.id;
    END LOOP;
END $$;

-- Especialista: transforma { segunda: { start, end, ... } } em { segunda: [{ start, end, ... }] }
DO $$
DECLARE
    r RECORD;
    new_wd JSONB;
BEGIN
    FOR r IN SELECT id, "workingDays" FROM specialists LOOP
        new_wd := (
            SELECT jsonb_object_agg(key, jsonb_build_array(value))
            FROM jsonb_each(r."workingDays")
        );
        UPDATE specialists SET "workingDays" = new_wd WHERE id = r.id;
    END LOOP;
END $$;
