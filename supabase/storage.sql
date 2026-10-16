-- Creates the public "audio" folder (bucket) where the US/UK audio files live.
-- Paste into the Supabase SQL Editor and press Run. Safe to run again.
-- Anyone can LISTEN to files in a public bucket, but only the project owner
-- (through the dashboard) can add, change or delete them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('audio', 'audio', true, 1048576, array['audio/mpeg'])
on conflict (id) do update set public = true, file_size_limit = 1048576, allowed_mime_types = array['audio/mpeg'];
