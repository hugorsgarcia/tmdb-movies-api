import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// If .env isn't found in current dir, we can fall back to parent dir
dotenv.config({ path: path.join(process.cwd(), '../.env') });
// Then try current dir .env, which overrides the above
dotenv.config(); 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
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
