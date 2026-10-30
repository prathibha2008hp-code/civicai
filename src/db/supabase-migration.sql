-- ====================================================================
-- CivicAI - Complete Supabase PostgreSQL Database Migration Script
-- Production-Ready Schema, Indexes, Foreign Keys, Triggers & RLS Policies
-- ====================================================================

-- Enable pgcrypto / uuid-ossp if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. ENUMS
-- --------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('citizen', 'authority', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE complaint_priority AS ENUM ('Low', 'Medium', 'High', 'Emergency');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE complaint_status_type AS ENUM (
        'Submitted',
        'Under Review',
        'Assigned',
        'In Progress',
        'Resolved',
        'Reopened',
        'Rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- --------------------------------------------------------------------
-- 2. CORE TABLES
-- --------------------------------------------------------------------

-- 1. profiles (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role user_role DEFAULT 'citizen' NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. departments
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. complaints
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    image_url TEXT,
    priority complaint_priority DEFAULT 'Medium' NOT NULL,
    priority_score INT DEFAULT 50 CHECK (priority_score BETWEEN 0 AND 100),
    status complaint_status_type DEFAULT 'Submitted' NOT NULL,
    assigned_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    ai_summary TEXT,
    ai_priority_reason TEXT,
    is_anonymous BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. complaint_status_history
CREATE TABLE IF NOT EXISTS public.complaint_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
    old_status complaint_status_type,
    new_status complaint_status_type NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. complaint_duplicates
CREATE TABLE IF NOT EXISTS public.complaint_duplicates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
    related_complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
    similarity_score NUMERIC(4, 3) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_duplicate_pair UNIQUE (complaint_id, related_complaint_id)
);

-- 6. complaint_supporters
CREATE TABLE IF NOT EXISTS public.complaint_supporters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_supporter UNIQUE (complaint_id, user_id)
);

-- 7. assignments
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
    assigned_to TEXT,
    deadline DATE,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. resolution_evidence
CREATE TABLE IF NOT EXISTS public.resolution_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT NOT NULL,
    submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. public_alerts
CREATE TABLE IF NOT EXISTS public.public_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location_name TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'Warning',
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 3. PERFORMANCE INDEXES
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON public.complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_dept ON public.complaints(assigned_department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_coords ON public.complaints(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_history_complaint_id ON public.complaint_status_history(complaint_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_supporters_complaint ON public.complaint_supporters(complaint_id);

-- --------------------------------------------------------------------
-- 4. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        'citizen', -- Always default to citizen for security
        COALESCE(NEW.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Prevent users from escalating their own role
CREATE OR REPLACE FUNCTION public.prevent_self_role_escalation()
RETURNS trigger AS $$
BEGIN
    IF (OLD.role IS DISTINCT FROM NEW.role) THEN
        -- Only allow role change if the current executing user is an admin
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        ) THEN
            RAISE EXCEPTION 'Unauthorized: Users cannot change their own civic permissions role.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_role_protection ON public.profiles;
CREATE TRIGGER enforce_role_protection
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_self_role_escalation();

-- Automatic Ticket Number Generator
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS trigger AS $$
DECLARE
    seq_num INT;
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        SELECT COUNT(*) + 1001 INTO seq_num FROM public.complaints;
        NEW.ticket_number := 'CIV-' || TO_CHAR(NOW(), 'YYYY') || '-' || seq_num;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_ticket_number ON public.complaints;
CREATE TRIGGER set_ticket_number
    BEFORE INSERT ON public.complaints
    FOR EACH ROW EXECUTE FUNCTION public.generate_ticket_number();

-- Automatic Updated_At Trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_updated_at ON public.complaints;
CREATE TRIGGER trigger_set_updated_at
    BEFORE UPDATE ON public.complaints
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- --------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_duplicates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resolution_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_alerts ENABLE ROW LEVEL SECURITY;

-- Helper security functions
CREATE OR REPLACE FUNCTION public.is_authority_or_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('authority', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES Policies
CREATE POLICY "Public profile lookup for verification" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own personal profile details" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- DEPARTMENTS Policies
CREATE POLICY "Anyone can view municipal departments" ON public.departments
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage departments" ON public.departments
    FOR ALL USING (public.is_admin());

-- COMPLAINTS Policies
CREATE POLICY "Public complaints transparency view" ON public.complaints
    FOR SELECT USING (true);

CREATE POLICY "Authenticated citizens can file complaints" ON public.complaints
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        (user_id = auth.uid() OR is_anonymous = true)
    );

CREATE POLICY "Citizens can update their own pending complaints" ON public.complaints
    FOR UPDATE USING (
        user_id = auth.uid() AND status = 'Submitted'
    );

CREATE POLICY "Authorities and Admins can update any complaint" ON public.complaints
    FOR UPDATE USING (public.is_authority_or_admin());

-- STATUS HISTORY Policies
CREATE POLICY "Anyone can view complaint timeline history" ON public.complaint_status_history
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users and authorities can record status history" ON public.complaint_status_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- COMPLAINT DUPLICATES Policies
CREATE POLICY "Anyone can view linked duplicates" ON public.complaint_duplicates
    FOR SELECT USING (true);

CREATE POLICY "Authorities can link duplicates" ON public.complaint_duplicates
    FOR ALL USING (public.is_authority_or_admin());

-- COMPLAINT SUPPORTERS Policies
CREATE POLICY "Anyone can view complaint supporter counts" ON public.complaint_supporters
    FOR SELECT USING (true);

CREATE POLICY "Authenticated citizens can upvote/support complaints" ON public.complaint_supporters
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Citizens can retract their support" ON public.complaint_supporters
    FOR DELETE USING (auth.uid() = user_id);

-- ASSIGNMENTS Policies
CREATE POLICY "Authorities and Admins can view assignments" ON public.assignments
    FOR SELECT USING (public.is_authority_or_admin() OR auth.role() = 'authenticated');

CREATE POLICY "Authorities and Admins can create and edit assignments" ON public.assignments
    FOR ALL USING (public.is_authority_or_admin());

-- RESOLUTION EVIDENCE Policies
CREATE POLICY "Anyone can view resolution proof evidence" ON public.resolution_evidence
    FOR SELECT USING (true);

CREATE POLICY "Authorities can upload resolution evidence" ON public.resolution_evidence
    FOR INSERT WITH CHECK (public.is_authority_or_admin());

-- NOTIFICATIONS Policies
CREATE POLICY "Users can only view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can mark their own notifications as read" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- PUBLIC ALERTS Policies
CREATE POLICY "Anyone can view public hazard alerts" ON public.public_alerts
    FOR SELECT USING (true);

CREATE POLICY "Authorities and Admins can broadcast public alerts" ON public.public_alerts
    FOR ALL USING (public.is_authority_or_admin());

-- --------------------------------------------------------------------
-- 6. DEFAULT MUNICIPAL DEPARTMENTS SEEDING
-- --------------------------------------------------------------------
INSERT INTO public.departments (name, description) VALUES
    ('Road Infrastructure & Traffic Engineering', 'Arterial roads, pothole repairs, street pavement milling, and traffic calming humps.'),
    ('Water Supply & Sewerage Board', 'Drinking water pipelines, sewer mainline blockages, manholes, and potable water purity.'),
    ('Solid Waste Management Corporation', 'Door-to-door waste collection, commercial blackspots, and litter remediation.'),
    ('Electricity Distribution & Public Lighting', 'Streetlights, overhead power distribution cables, and municipal transformer maintenance.'),
    ('Storm Water Drainage & Flood Mitigation', 'Culvert de-silting, roadside trenching, monsoon stormwater runoff management.'),
    ('Public Health & Vector Sanitation', 'Mosquito abatement, fogging, public health sanitation, and stray animal containment.')
ON CONFLICT (name) DO NOTHING;

-- --------------------------------------------------------------------
-- 7. SUPABASE STORAGE BUCKET CONFIGURATION (Run if Storage enabled)
-- --------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('civic-evidence', 'civic-evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Anyone can read civic evidence photos
CREATE POLICY "Public Access to Evidence Photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'civic-evidence');

-- Storage RLS: Authenticated users can upload evidence photos
CREATE POLICY "Authenticated users can upload evidence photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'civic-evidence' AND auth.role() = 'authenticated');
