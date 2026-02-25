import { createClient } from '@supabase/supabase-js';

// TEMPORARY HARDCODE TO BYPASS ENV LOADING ISSUE
const supabaseUrl = 'https://iivkxnrhxazuygylucdv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpdmt4bnJoeGF6dXlneWx1Y2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MjU3NzgsImV4cCI6MjA4NzQwMTc3OH0.RNX4FSY4v0ZR1arFyudKX6eglS8N__bOO1wVhLprKs4';

console.log('Supabase Client Initializing with hardcoded values');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
