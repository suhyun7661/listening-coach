import { createClient } from '@supabase/supabase-js';

// Only the public URL and the public (publishable) key are used in the browser.
// They come from the .env file. If .env is missing, the site still works without login.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;
