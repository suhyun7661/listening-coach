# Listening Coach – project brief

## What this is
Listening Coach is an English listening practice website for Korean learners who are comfortable with academic English and reading, but struggle with fast, natural native speech and unfamiliar conversational expressions (for example "on a whim"). Complete beginners are not the target.
- Built: dictation practice on video clips (speed control, levels 1-6, US/UK clips); listening error analysis (diagnostic report with five error categories, history and progress charts); a notebook and vocabulary quiz for missed words (spaced 1, 3, 7 days); Competing mode (friends type the same sentence, live leaderboard); an Admin page to add clips.
- Planned (see "Product direction" and docs/redesign-plan.md): same-day review (expression cards, write your own sentence, model sentence) and delayed review of missed sentences with changing blanks.

## About the person building this
- I am a complete beginner with no web development experience.
- Explain what you did after each step in short, simple English.
- Work one stage at a time (see "Build stages"). Don't start the next stage until I say so.
- Before big decisions (new library, new service, deleting files), ask me first.
- When something needs my action (making an account, pasting a secret key), tell me exactly what to click and where.
- After each stage: run the app, check it builds without errors, then make a git commit with a clear message.
- Answer my questions in chat first. Only create new documents or files when I ask for them (offer first).
- When I ask for a check or an edit of project notes (like this file), show me the changes before committing them.

## Permanent requirement: this is a WEBSITE
- Listening Coach is a website that runs in a web browser. It is NOT a mobile phone app.
- Never build or suggest a native/mobile app (no React Native, Expo, Capacitor, app stores, or app installs) unless I explicitly change this rule.
- "Works on phones" only means the website layout is responsive when opened in a phone's browser.
- Design for laptop/desktop browsers first, then make sure the same site adapts to smaller screens.

## Local-only for now
- Do NOT deploy or publish the site (Vercel or anywhere else) until I explicitly say so. Develop and test locally (`npm run dev`).
- Stage 7 (Deploy to Vercel) is on hold. `vercel.json` is already prepared and stays unused. Continue with the other stages; ask me before deploying.

## Current status (updated 2026-10-20)
- Done: stages 1-6, 8-12, 13+15 (built; real-video test pending), 14. Stage 7 (deploy) is on hold; stage 16 (real-user testing) comes last.
- Waiting on: the first real Higgsfield video. Until then the sample clips use a pretend-clock player.
- Before using the Admin page the first time, I (the user) must run `supabase/storage.sql` and make my account admin (the SQL is shown on the /admin page when not admin). Then do a first test clip.
- Adding a clip: Admin page (details, transcript, timing helper, Korean, key expressions, save), then `npm run make:audio` and drag the new files from `generated-audio` into the Supabase Storage `audio` folder.
- If `supabase/schema.sql` changes, I paste the whole file into the Supabase SQL Editor again (it is safe to run twice).
- Update 2026-10-20: the new product direction and the redesign plan are decided (docs/redesign-plan.md). Stages 17-22 are NOT started yet. The Library filters (level, accent, source, search) were fixed and committed. I am writing scripts and prompts for my own Higgsfield videos (the 20 idioms from my list + 30 common phrases, mid-20s themes); none of the real videos exist yet. The older docs/video-brief-for-professor.md is outdated (its scripts were replaced in chat discussions).
- Working order I chose: (1) make the videos, (2) fix small errors, (3) later simplify and organize the design (button proposal: one main button per screen; not decided yet).

## Product direction (decided 2026-10-20, replaces earlier ideas where they differ)
- Target user: intermediate/advanced learners, strong in academic vocabulary and reading, weak in fast casual conversation and natural expressions. Complete beginners are NOT the target.
- Main loop: (1) Dictation with video (speed, level, US/UK) -> (2) Error analysis + same-day review -> (3) Delayed review.
- Error analysis: diagnostic report (accumulated misses + likely causes); error notebook for casual expressions with exactly four elements: Meaning, Why it has that meaning (written in KOREAN, with English examples), Similar expressions, Example sentences; same-day review = the learner writes their own sentences with the expressions of the day, guided by a short context/situation prompt.
- Delayed review (days later): same video/audio, but the blanks change each round. The previously missed expression stays blanked in the FIRST review; the other blanks change every round. Also meaning quiz and a repeated writing task (use a new prompt for the same expression).
- Error categories stay CS, SP, V, AC, MI: auto-guessed, learner can change (store autoTag and userTag).
- Secondary: Competing mode (done).
- Decided NOT to build: Time Attack, Australian accent, placement test (for now).
- NO AI feedback on writing (decided). After the learner writes a sentence, the app shows a MODEL sentence and a short self-check checklist. No paid AI service. Full plan: docs/redesign-plan.md.
- Planned next stages (details in docs/redesign-plan.md): 17 expression content (why/similar/examples/writing prompts) in Admin + notebook cards; 18 same-day review flow (report -> expressions -> write with model sentence + self-check); 19 delayed review engine (same audio, changing blanks, missed expression blanked first); 20 "Today" hub + new menu (Today / Practice / Notebook / Compete); 21 fix the V rule and add per-category tips; 22 pilot preparation.

## Product
A website that trains Korean learners to understand fast, natural English through fill-in-the-blank dictation on video clips.
Main weaknesses it targets: speed (SP), unfamiliar vocabulary (V), connected speech (CS).
Two modes: Practice (full clip, all support tools) and Competing (one sentence, same rules for everyone).
The site must work on laptops and phones (responsive).

## Tech stack
- Frontend: React + Vite, React Router. Plain CSS with CSS variables (no CSS framework).
- Backend (from Stage 8): Supabase (Auth, Postgres database, Storage, Realtime).
- Hosting: Vercel.
- Accent audio: Google Cloud Text-to-Speech, generated once per sentence by a script, saved to Supabase Storage.
- Video: YouTube IFrame Player API for YouTube clips; HTML5 <video> for uploaded files (Higgsfield videos).

## How to run and set up
- Run the site: `npm run dev` then open http://localhost:5173. Check the build: `npm run build`.
- Helper commands: `npm run check:clips` (checks the 5 sample clip files), `npm run make:seed` (rewrites supabase/seed.sql from the sample clips), `npm run make:audio` (makes US/UK MP3 files in the `generated-audio` folder; add `-- --dry-run` to only count them, no key needed).
- Secret settings live in the `.env` file (git-ignored; `.env.example` is the template). Names only: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (the public key, safe in the browser), `GOOGLE_TTS_API_KEY` (secret; used only by `make:audio` on my computer, never in website code). Optional: `TTS_VOICE_US`, `TTS_VOICE_UK`.
- Database setup in the Supabase SQL Editor, in this order: 1) `supabase/schema.sql` (tables, security rules, Competing-mode functions; safe to run again), 2) `supabase/seed.sql` (the 5 sample clips), 3) `supabase/storage.sql` (the `audio` and `videos` folders; needs schema.sql first).
- Tables: profiles, clips, sentences, attempts, blank_results, notebook_items, challenges, challenge_members, challenge_results, challenge_runs. Row Level Security is on for every table.
- Storage folders: `audio` (public; MP3 names like `<clipId>-<sentenceId>-us.mp3` and `word-<word>-uk.mp3`) and `videos` (public to watch, only admins can upload; mp4 or webm, 50 MB per file).
- How data flows: clips load from Supabase (`src/lib/clipStore.js` and `ClipsProvider`); the sample clips in `src/data/clips` are only a backup. Reports are saved to my account when signed in, and only in this browser (localStorage) when signed out. Notebook, vocab quiz and Competing mode need sign-in. The Competing-mode rules (3 plays, 60 seconds, one attempt, grading) are enforced by database functions, not by the browser.
- Admin page (`/admin`) works only for an admin account (`profiles.is_admin = true`); the page shows the one-time SQL to make my account admin.
- Testing: there is no automatic test suite in the repo. Changes are checked with the build, the helper scripts, scratch database tests kept outside the project, and manual checks in the browser.

## Design system (match the approved screens in /reference/screens)
Colors (no black anywhere):
- Violet `#5B3DF5`: brand, header background, selected items, score card
- Coral `#FF6B4A`: main buttons, active menu item, progress bars (text on coral is indigo)
- Yellow `#FFE066`: highlights on violet (logo, score number)
- Deep indigo `#1E1650`: all body text
- Lavender `#F5F3FF`: page background
- Border `#E4DFFB`, strong border `#D6D0F5`, muted text `#5A5480`
- Deep violet `#2E1F8F`: video area
- Lighter violet `#4A2FD9`: secondary buttons on violet
Error tag colors (background / text):
- CS `#EDE3FF` / `#5B2D9E`
- SP `#FFE8D1` / `#8A4300`
- V `#DCE7FF` / `#1F3F99`
- AC `#DDF3EA` / `#1E6B4A`
- MI `#FFE0EC` / `#A3124F`
Type: Manrope (English) + Noto Sans KR (Korean), from Google Fonts.
Shape: pill-shaped menu items, buttons with 14px corners, cards with 16px corners.
Header: violet bar with logo "Listening Coach" in yellow, menu (Library, Practice, Compete, Vocab quiz, Notebook), account button; two soft decorative circles (coral and yellow) on the right.
Clip thumbnails: each clip has its own bright color with a coral play button.
Accessibility: visible keyboard focus, real buttons and labels, respect reduced motion.

## Screens
1. Home / Library: weakness summary (SP, V, CS, AC, MI counts), Practice / Competing mode buttons, filters (level 1–6, accent US/UK, source YouTube/original), clip cards.
2. Practice dictation: video player, Replay sentence, Loop sentence, speed buttons (0.5x, 0.75x, 1x, 1.25x; user chooses, never forced), sentence card, sentence tracker, scene summary (Levels 1–2 only), Submit clip.
3. Review: score, five-category chart with main weakness, sentence rows (mistake crossed out, correct word, Korean translation, expression note, category picker), Replay / Compare US-UK / Save to notebook, Full script, Start vocab quiz.
4. Vocab quiz: question types (listen and type, meaning match, fill the gap), US/UK play buttons, due-for-review list.
5. Competing: room code, share link, label text (e.g. "Loser buys lunch"), rules, play counter, timer, blanks, live leaderboard.
6. Admin (later): add clip, paste transcript, timestamp editor, draft translation, mark key expressions, generate accent audio.

Update 2026-10-20 (current vs planned):
- Admin is now BUILT: details, video upload or YouTube link, transcript, timing helper, Korean, key expressions, save. NOT built: draft translation and one-click audio (audio is made with `npm run make:audio`).
- Also built beyond the six screens: Login and Account, Past reports (History), Progress charts, Notebook, and the Library search/filters.
- Current header menu: Library, Practice, Compete, Vocab quiz, Notebook. PLANNED menu (Stage 20): Today, Practice, Notebook, Compete (Library merges into Practice, Vocab quiz moves inside Notebook, History and Progress merge into one Report area).

## Clip data format
```json
{
  "id": "holiday-pub-01",
  "source": "youtube",            // or "file"
  "videoId": "abc123",            // for "file": storage URL instead
  "title": "The Holiday – Pub scene",
  "accent": "UK",
  "difficulty": 4,
  "contextKo": "아이리스가 펍에서 처음 만난 사람과 이야기하는 장면이에요.",
  "sentences": [
    {
      "id": "s1",
      "start": 12.4,
      "end": 15.1,
      "text": "I just came here on a whim.",
      "ko": "그냥 즉흥적으로 여기 온 거예요.",
      "keyWords": [{ "word": "on a whim", "ko": "충동적으로, 별 계획 없이", "note": "Used for a sudden decision with no plan" }],
      "glosses": { "came": "왔다", "here": "여기" },
      "ttsAudio": { "US": "audio/holiday-01-us.mp3", "UK": "audio/holiday-01-uk.mp3" }
    }
  ]
}
```

## Dictation rules
Levels (each level up removes one kind of hint; hints appear automatically, no hint button):

| Level | Blanks per sentence | Korean meaning above blank | First letter | Letter count | Scene summary |
|---|---|---|---|---|---|
| 1 | 1 | every blank | yes | yes | yes |
| 2 | 2 | every blank | no | yes | yes |
| 3 | 3 | key expressions only | no | yes | no |
| 4 | 4 | none | no | yes | no |
| 5 | half the words | none | no | no | no |
| 6 | all words | none | no | no | no |

- Blank priority: key expressions, then small fast words, then connected-speech words, then other content words. Use a seeded random so the same sentence and level always give the same blanks.
- Without a letter-count hint, all blanks have the same width.
- Automatic progression: one sentence at a time. When every blank has text, show a 2-second countdown bar, then show the next sentence and focus its first blank. Typing restarts the countdown. Enter moves to the next blank in the sentence (after the last blank it goes to the first empty one), or advances immediately when all are filled. The cursor is always ready in a blank: it returns there after Replay/Loop/speed clicks, and typing with nothing focused jumps into the blank. Revisiting a finished sentence never auto-advances unless edited. After the last sentence, wait for the user to press Submit.
- Never pause or control the video when sentences change.
- Korean translation of whole sentences only appears after grading.
- Grading: ignore case and punctuation; accept contractions and equivalents (gonna = going to, I'm = I am); a one-letter typo on 5+ letter words = 0.5 point ("almost"); empty = wrong.
- Score = points / blanks. Error categories never change the score.

## Five error categories
- CS Connected speech, SP Speed, V Unfamiliar vocabulary, AC Accent, MI Missed the main idea.
- Each wrong or empty blank gets an automatic guess, checked in this order:
  1. CS: reduced spelling (gonna, dija…), two words merged or split, or word cut short by 2+ letters (mount for mountain)
  2. V: key expression, or uncommon word of 6+ letters
  3. MI: 60%+ of a sentence with 3+ blanks missed
  4. AC: clip accent differs from user's accent and answer is within edit distance 2
  5. SP: everything else, including empty
- The review shows all five as chips with the guess marked "suggested"; one tap changes it. Store both autoTag and userTag. "Almost" answers get no category.
- Main weakness = category with the most misses.

## Reference code
/reference/listening-coach-update contains working code for blanks, grading, error tags, SentenceDictation, ReviewPanel and styles. Reuse it instead of rewriting.

## Other features
- Compare accents: real clip first; then pre-made US and UK TTS audio for the same sentence.
- Notebook + vocab quiz from the user's own missed key words; spaced repetition: wrong items return after 1, then 3, then 7 days.
- Progress dashboard: error categories over time, scores per level.
- Competing mode: same sentence, level and blanks for all; 1x speed only; max 3 plays; 60 seconds; no hints or translation; one attempt; player controls hidden. Ranking: accuracy, then fewer plays, then faster time. Count plays and time on the server. Live leaderboard with Supabase Realtime. Room code + share link.

## Rules that must not be broken
- Never download or re-host YouTube videos; embed only.
- Never copy official Korean subtitles; translations are our own.
- The app never handles money. The lunch bet is only a text label.
- Never put secret keys in frontend code or commit them; use .env files listed in .gitignore. Ask me to paste keys into .env myself.
- Supabase: Row Level Security on every table; users only see their own data (challenge results are visible to room members).

## Build stages
1. Project setup, design tokens, shared header and routing for all screens
2. All screens as static pages with sample data, matching /reference/screens
3. Clip data files (5 sample clips with sentences, Korean, glosses, key words)
4. Video player for YouTube and file sources: speed, replay sentence, loop
5. Dictation with levels, automatic hints and automatic progression
6. Review page with grading and the five error categories
7. Deploy to Vercel (first working version, no login)
8. Supabase project and tables: profiles, clips, sentences, attempts, blank_results (autoTag, userTag), notebook_items, challenges, challenge_results
9. Login (Supabase Auth)
10. Save attempts and tags; Home weakness summary from real data; progress dashboard
11. Vocab quiz and spaced repetition
12. Compare accents (TTS script + Storage)
13. Uploaded video files (Higgsfield) via Storage
14. Competing mode with live leaderboard
15. Admin page for adding clips
16. Testing with real users and fixes
Added 2026-10-20 (not started; details in docs/redesign-plan.md):
17. Expression content (why in Korean + English examples, similar expressions, examples, writing prompts) in Admin, and four-part notebook cards
18. Same-day review flow: report, expressions, write (model sentence + self-check)
19. Delayed review engine: same audio, changing blanks, missed expression blanked first, 1/3/7 day queue
20. "Today" hub and the new menu (Today / Practice / Notebook / Compete), merged Report area, quiz inside Notebook
21. Fix the V rule and add one tip per error category
22. Pilot preparation (first real videos, then decide about going online, then Stage 16 testing)

## Known issues and next fixes (2026-10-20)
- No real video has been added yet. The YouTube player, the uploaded-file player, and the Admin upload and save have never been tried with a real video. Until then the sample clips use a pretend-clock player.
- Review page: the per-sentence "Replay" button is switched off ("Coming in a later stage"). "Compare US/UK" plays the US and UK sentence recordings only; it does not play the real clip first.
- Notebook still saves a missed word with its meaning and a note only. The four-part expression cards come in Stage 17.
- The "V" error guess marks any uncommon word of 6+ letters as unfamiliar, which is wrong for learners strong in academic vocabulary (fix planned in Stage 21).
- Only the 5 sample clips exist. New clips need `npm run make:audio` plus dragging the new MP3 files into Supabase Storage (manual step).
- The quiz and Competing mode use US/UK recordings; if a recording is missing they fall back to a voice installed on the computer, which may not exist.
- Button and screen simplification (one main button per screen, step bar) was proposed but not decided.
- docs/video-brief-for-professor.md is outdated; docs/redesign-plan.md is the current plan.
