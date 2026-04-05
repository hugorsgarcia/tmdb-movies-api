import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// In local dev, load from parent project's .env (shared credentials)
// On Render (production), env vars are injected directly — no .env file needed
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: path.join(process.cwd(), '../.env') });
    dotenv.config(); // local notifier/.env overrides parent if it exists
}

// Accept both SUPABASE_URL (Render) and NEXT_PUBLIC_SUPABASE_URL (local dev shared .env)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
// MUST use Service Role Key to bypass RLS for background jobs
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
    process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
