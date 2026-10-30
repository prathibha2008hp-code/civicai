-- ====================================================================
-- CivicAI Supabase Database Schema
-- Production Ready DDL for PostgreSQL with Row Level Security (RLS)
-- Phase 2 Preparedness for Supabase PostgreSQL & Storage
-- ====================================================================

-- 1. Enums
CREATE TYPE user_role AS ENUM ('citizen', 'official', 'supervisor', 'admin');
CREATE TYPE complaint_severity AS ENUM ('Low', 'Medium', 'High', 'Emergency');
CREATE TYPE complaint_status AS ENUM ('Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Reopened', 'Rejected');
CREATE TYPE hazard_severity AS ENUM ('Warning', 'Critical', 'Informational');

-- 2. profiles (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role user_role DEFAULT 'citizen',
    department_id UUID,
    ward TEXT,
    preferred_language VARCHAR(5) DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. departments
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    head_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    current_quarter_budget NUMERIC(15,2) DEFAULT 0,
    spent_budget NUMERIC(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. maintenance_teams
CREATE TABLE IF NOT EXISTS public.maintenance_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    lead_name TEXT NOT NULL,
    active_members INT DEFAULT 5,
    status VARCHAR(20) DEFAULT 'Available',
    contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. complaints
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(30) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    severity complaint_severity DEFAULT 'Medium',
    priority_score INT CHECK (priority_score BETWEEN 0 AND 100),
    status complaint_status DEFAULT 'Submitted',
    
    citizen_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    citizen_name TEXT,
    citizen_phone TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    language VARCHAR(5) DEFAULT 'en',
    
    address TEXT NOT NULL,
    ward TEXT NOT NULL,
    zone TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    nearby_landmark TEXT,
    
    before_image_url TEXT,
    audio_voice_note_url TEXT,
    supporters_count INT DEFAULT 0,
    
    is_duplicate BOOLEAN DEFAULT false,
    duplicate_of_id UUID REFERENCES public.complaints(id) ON DELETE SET NULL,
    root_cause_cluster_id UUID,
    is_hotspot BOOLEAN DEFAULT false,
    
    assigned_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    assigned_team_id UUID REFERENCES public.maintenance_teams(id) ON DELETE SET NULL,
    target_resolution_date DATE,
    is_escalated BOOLEAN DEFAULT false,
    escalation_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. complaint_images
CREATE TABLE IF NOT EXISTS public.complaint_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    image_type VARCHAR(20) CHECK (image_type IN ('before', 'after', 'inspection')),
    storage_path TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. complaint_ai_analyses
CREATE TABLE IF NOT EXISTS public.complaint_ai_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    summary TEXT NOT NULL,
    severity complaint_severity NOT NULL,
    priority_score INT NOT NULL,
    risk_factors JSONB DEFAULT '[]'::jsonb,
    recommended_department TEXT,
    recommended_action TEXT,
    reasoning TEXT,
    confidence_score NUMERIC(3,2),
    community_impact JSONB,
    estimated_cost_range TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. duplicate_links
CREATE TABLE IF NOT EXISTS public.duplicate_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    duplicate_complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    similarity_score NUMERIC(3,2),
    detected_by_ai BOOLEAN DEFAULT true,
    confirmed_by_officer UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. complaint_supporters
CREATE TABLE IF NOT EXISTS public.complaint_supporters (
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (complaint_id, user_id)
);

-- 10. root_cause_clusters
CREATE TABLE IF NOT EXISTS public.root_cause_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    affected_ward TEXT NOT NULL,
    incident_count INT DEFAULT 1,
    severity complaint_severity DEFAULT 'High',
    identified_root_cause TEXT NOT NULL,
    recommended_action TEXT,
    status VARCHAR(30) DEFAULT 'Open',
    detected_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. assignments
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id),
    team_id UUID REFERENCES public.maintenance_teams(id),
    assigned_by UUID REFERENCES public.profiles(id),
    target_date DATE,
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. status_history
CREATE TABLE IF NOT EXISTS public.status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    status complaint_status NOT NULL,
    actor_id UUID REFERENCES public.profiles(id),
    actor_role VARCHAR(20) NOT NULL,
    notes TEXT,
    evidence_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. escalation_records
CREATE TABLE IF NOT EXISTS public.escalation_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    escalated_by UUID REFERENCES public.profiles(id),
    reason TEXT NOT NULL,
    previous_priority INT,
    escalated_priority INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. resolution_evidence
CREATE TABLE IF NOT EXISTS public.resolution_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    resolved_by_team_id UUID REFERENCES public.maintenance_teams(id),
    completion_summary TEXT NOT NULL,
    after_image_url TEXT NOT NULL,
    materials_used JSONB,
    crew_hours_spent INT,
    cost_incurred NUMERIC(12,2),
    verified_by_officer UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. resolution_feedback
CREATE TABLE IF NOT EXISTS public.resolution_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    citizen_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_satisfied BOOLEAN NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    reopen_requested BOOLEAN DEFAULT false,
    reopen_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'status_update',
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. hazard_alerts
CREATE TABLE IF NOT EXISTS public.hazard_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    severity hazard_severity DEFAULT 'Warning',
    category TEXT NOT NULL,
    ward TEXT NOT NULL,
    location_description TEXT,
    message TEXT NOT NULL,
    recommended_precautions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- 18. hotspot_insights
CREATE TABLE IF NOT EXISTS public.hotspot_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_name TEXT NOT NULL,
    zone TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    radius_meters INT DEFAULT 400,
    primary_category TEXT NOT NULL,
    complaint_density INT DEFAULT 0,
    risk_trend VARCHAR(20) DEFAULT 'Increasing',
    chronic_issues JSONB DEFAULT '[]'::jsonb,
    ai_preventive_recommendation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. action_briefs
CREATE TABLE IF NOT EXISTS public.action_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    priority_headline TEXT NOT NULL,
    tactical_directives JSONB NOT NULL,
    required_machinery JSONB,
    estimated_man_hours TEXT,
    budget_ceiling TEXT,
    safety_protocol TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. maintenance_budgets
CREATE TABLE IF NOT EXISTS public.maintenance_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    fiscal_quarter VARCHAR(10) NOT NULL,
    total_allocated NUMERIC(15,2) NOT NULL,
    total_spent NUMERIC(15,2) DEFAULT 0,
    emergency_reserve NUMERIC(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id),
    action_type VARCHAR(50) NOT NULL,
    target_table VARCHAR(50) NOT NULL,
    target_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for high-performance spatial and filtered querying
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_category ON public.complaints(category);
CREATE INDEX idx_complaints_ward ON public.complaints(ward);
CREATE INDEX idx_complaints_priority ON public.complaints(priority_score DESC);
CREATE INDEX idx_complaints_lat_lng ON public.complaints(lat, lng);
CREATE INDEX idx_status_history_complaint ON public.status_history(complaint_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resolution_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hazard_alerts ENABLE ROW LEVEL SECURITY;

-- Public can read non-private complaint data
CREATE POLICY "Public complaints viewable by everyone" ON public.complaints
    FOR SELECT USING (true);

-- Authenticated citizens can create complaints
CREATE POLICY "Citizens can insert complaints" ON public.complaints
    FOR INSERT WITH CHECK (auth.uid() = citizen_id OR citizen_id IS NULL);

-- Officials can update complaints
CREATE POLICY "Officials can update complaints" ON public.complaints
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('official', 'supervisor', 'admin')
        )
    );

-- Enable Realtime for complaints and alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hazard_alerts;
