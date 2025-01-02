import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfzcttwhzpdhdvcqbucq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmemN0dHdoenBkaGR2Y3FidWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3MDMxMzksImV4cCI6MjA1MTI3OTEzOX0.WlwybbyydyqGAE-CuxzB8Co0UA72d44vZHlwp2rsiqI';

export const supabase = createClient(supabaseUrl, supabaseKey);
