import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Read Supabase credentials from environment variables.
const supabaseUrl = 'https://ciydqilvpxggduyrejfd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpeWRxaWx2cHhnZ2R1eXJlamZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MjIxNjcsImV4cCI6MjA3NTk5ODE2N30.fJoD0s-eGqv5dlP59qZ-0NvnFHklpKm6HpmMKKqTfhE';

// Export a flag to check if Supabase is properly configured.
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Conditionally initialize the client.
let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
    supabase = createClient(supabaseUrl!, supabaseAnonKey!);
} else {
    // Log a warning for developers. The UI will show a user-friendly message.
    console.warn(
        'Supabase credentials are not set in environment variables (SUPABASE_URL, SUPABASE_ANON_KEY). ' +
        'The application will not be able to connect to the database.'
    );
}

// Export the supabase client. It will be `null` if not configured.
export { supabase };