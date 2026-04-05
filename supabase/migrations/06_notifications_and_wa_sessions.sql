-- Migration 06: Notifications Queue & WhatsApp Sessions Table

-- 1. Create WhatsApp Sessions Table (used by Baileys to persist Auth data)
CREATE TABLE IF NOT EXISTS public.whatsapp_sessions (
    id VARCHAR(255) PRIMARY KEY, -- The dictionary key given by Baileys
    data JSONB NOT NULL,         -- The credential contents
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Protect internal table: only service_role (Microservice) can access it
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service Role Only WA Sessions" ON public.whatsapp_sessions AS PERMISSIVE FOR ALL TO service_role USING (true);


-- 2. Create Notifications Queue Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    channel VARCHAR(20) NOT NULL, -- 'whatsapp', 'email'
    destination VARCHAR(255) NOT NULL, -- phone number or email string
    title VARCHAR(255),
    body TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    error_log TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for cron job fast querying
CREATE INDEX IF NOT EXISTS idx_notifications_status_scheduled ON public.notifications (status, scheduled_at);

-- RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only read their own notifications
CREATE POLICY "Users can view their notifications" 
    ON public.notifications FOR SELECT 
    USING (auth.uid() = user_id);

-- Users can insert notifications for themselves
CREATE POLICY "Users can insert their own notifications" 
    ON public.notifications FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can update (cancel/reschedule) their own pending notifications
CREATE POLICY "Users can update their pending notifications" 
    ON public.notifications FOR UPDATE 
    USING (auth.uid() = user_id AND status = 'pending')
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their pending notifications
CREATE POLICY "Users can delete their pending notifications" 
    ON public.notifications FOR DELETE 
    USING (auth.uid() = user_id AND status = 'pending');

-- Service role has full access
CREATE POLICY "Service role full access on notifications" 
    ON public.notifications AS PERMISSIVE FOR ALL TO service_role USING (true);
