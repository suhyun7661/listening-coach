# Supabase setup (v2)

1. Create a free project at https://supabase.com (Dashboard > New project).
2. Open **SQL Editor > New query**, paste all of `schema.sql`, press **Run**.
   (If you used the OLD version of this project, paste and run `cleanup-v2.sql` ONCE first.)
3. Copy `.env.example` to `.env` and paste the Project URL and the **anon public** key
   (Project Settings > API). Never use or share the `service_role` key.

The clip (Walk With Me) is not in the database. It lives in `src/data/clips/walk-with-me.js`,
and the video and audio are files in the `public/` folder.

## Tables
profiles, attempts, blank_results (auto_tag + user_tag). Row Level Security is on for every table.
A quiz-scores table is added in a later stage (Compete mode).
