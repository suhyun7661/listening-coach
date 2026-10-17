-- Storage folders (buckets). Paste into the Supabase SQL Editor and press Run. Safe to run again.
-- Run schema.sql FIRST (the video rules below use its is_admin() check).
-- Files in a public bucket can be watched/listened to by anyone with the link,
-- but only the right people can add, change or delete them.

-- 1) "audio": the US/UK recordings. Only the project owner adds files (in the dashboard).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('audio', 'audio', true, 1048576, array['audio/mpeg'])
on conflict (id) do update set public = true, file_size_limit = 1048576, allowed_mime_types = array['audio/mpeg'];

-- 2) "videos": your own clips (for example Higgsfield videos). Only ADMINS may upload.
--    50 MB per file (the limit of the free Supabase plan). mp4 or webm.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('videos', 'videos', true, 52428800, array['video/mp4', 'video/webm'])
on conflict (id) do update set public = true, file_size_limit = 52428800, allowed_mime_types = array['video/mp4', 'video/webm'];

drop policy if exists "videos: admin upload" on storage.objects;
create policy "videos: admin upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'videos' and public.is_admin());

drop policy if exists "videos: admin read" on storage.objects;
create policy "videos: admin read" on storage.objects
  for select to authenticated using (bucket_id = 'videos' and public.is_admin());

drop policy if exists "videos: admin update" on storage.objects;
create policy "videos: admin update" on storage.objects
  for update to authenticated using (bucket_id = 'videos' and public.is_admin()) with check (bucket_id = 'videos' and public.is_admin());

drop policy if exists "videos: admin delete" on storage.objects;
create policy "videos: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'videos' and public.is_admin());
