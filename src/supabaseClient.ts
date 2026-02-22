import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sljesfeyqgsqlscfrgse.supabase.co';
const supabaseKey = 'sb_publishable_lEGRPFyGdzby8Y6dXSjCFA_wRC0Zzc2';

export const supabase = createClient(supabaseUrl, supabaseKey);
