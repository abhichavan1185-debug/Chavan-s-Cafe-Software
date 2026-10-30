CREATE TABLE IF NOT EXISTS public.cafe_members (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cafe_records (
  collection TEXT NOT NULL,
  record_id TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (collection, record_id)
);

CREATE TABLE IF NOT EXISTS public.shrus_partner_locations (
  id BIGSERIAL PRIMARY KEY,
  partner_id TEXT NOT NULL,
  order_id TEXT,
  latitude NUMERIC(9,6) NOT NULL,
  longitude NUMERIC(9,6) NOT NULL,
  accuracy NUMERIC(8,2),
  speed NUMERIC(6,2),
  heading NUMERIC(6,2),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_real_gps BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE public.cafe_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cafe_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shrus_partner_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can read their own membership" ON public.cafe_members;
CREATE POLICY "Members can read their own membership"
  ON public.cafe_members FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Cafe members can manage cafe records" ON public.cafe_records;
CREATE POLICY "Cafe members can manage cafe records"
  ON public.cafe_records FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cafe_members
      WHERE user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cafe_members
      WHERE user_id = (SELECT auth.uid())
    )
  );

GRANT SELECT ON public.cafe_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cafe_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shrus_partner_locations TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.shrus_partner_locations_id_seq TO authenticated;
REVOKE ALL ON TABLE public.cafe_members FROM anon;
REVOKE ALL ON TABLE public.cafe_records FROM anon;
REVOKE ALL ON TABLE public.shrus_partner_locations FROM anon;
REVOKE ALL ON SEQUENCE public.shrus_partner_locations_id_seq FROM anon;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'cafe_records'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cafe_records;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'shrus_partner_locations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.shrus_partner_locations;
  END IF;
END $$;

DO $$
DECLARE
  legacy_table TEXT;
  existing_policy RECORD;
BEGIN
  FOREACH legacy_table IN ARRAY ARRAY[
    'shrus_partner_locations',
    'shrus_cafe_settings',
    'shrus_menu_items',
    'shrus_customers',
    'shrus_delivery_partners',
    'shrus_orders',
    'shrus_inventory',
    'shrus_expenses',
    'shrus_tables'
  ] LOOP
    IF to_regclass(format('public.%I', legacy_table)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', legacy_table);

      FOR existing_policy IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = legacy_table
      LOOP
        EXECUTE format('DROP POLICY %I ON public.%I', existing_policy.policyname, legacy_table);
      END LOOP;

      EXECUTE format(
        'CREATE POLICY "Cafe members can manage cafe records" ON public.%I FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.cafe_members WHERE user_id = (SELECT auth.uid()))) WITH CHECK (EXISTS (SELECT 1 FROM public.cafe_members WHERE user_id = (SELECT auth.uid())))',
        legacy_table
      );
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', legacy_table);
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated', legacy_table);
    END IF;
  END LOOP;
END $$;
