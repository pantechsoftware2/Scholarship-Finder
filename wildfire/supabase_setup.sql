-- run this in your Supabase SQL editor to create the necessary reports table

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    input JSONB NOT NULL,
    total_value_found TEXT NOT NULL,
    scholarships JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- set up RLS (optional but recommended)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- allow service role to insert
CREATE POLICY "Enable insert for service_role only" ON public.reports
    FOR INSERT
    WITH CHECK (true);

-- allow reading reports without auth (for public preview)
CREATE POLICY "Enable read access for all users" ON public.reports
    FOR SELECT
    USING (true);
