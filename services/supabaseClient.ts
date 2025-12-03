import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jnlbhiyazvexttfpuxxe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpubGJoaXlhenZleHR0ZnB1eHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzMyMTgsImV4cCI6MjA4MDM0OTIxOH0.Rbmq1gQDw8KkZKomqYZR114Y1j0ithgzprrnsjmnDxE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY.trim());