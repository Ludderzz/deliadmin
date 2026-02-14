import { createClient } from '@supabase/supabase-js';

// These names MUST match what you put in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// This is the "Named Export" that your other files are looking for
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log to console so you can see if the keys are actually loading
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ SUPABASE ERROR: Check your .env file. The keys are missing!");
} else {
  console.log("✅ Supabase Client Initialized for Admin");
}