# Listening Coach – project brief

## What this is
Listening Coach is an English listening practice website for Korean learners who are comfortable with academic English and reading, but struggle with fast, natural native speech and unfamiliar conversational expressions (for example "on a whim"). Complete beginners are not the target.
- FINAL DESIGN (v2, decided 2026-11-16, two rounds; full text in reference/feature-design-v2.md, it replaces the old plan wherever they differ): ONE video (Walk With Me); the main screen has only two choices, Practice Mode and Compete Mode. Practice = watch the video, then audio-only dictation at 3 levels (Easy / Intermediate / Hard), then a Review Report with five error categories the learner can change. Compete = a study page, then a 15-question expression quiz (Listen and Type, Meaning Match, Fill in the Gap; 5 of each, mixed) with feedback after each question, then results and a leaderboard against 5 fixed fictional competitors (updated 2026-11-17).
- Context: this is a university assignment. The professor opens one public URL and tests the site alone. Simple and reliable beats clever.
- The Review Report is the ONLY way to review mistakes. There is no Notebook, no review schedule, no History and no Progress.
- Already built and kept: dictation engine (blanks, hints, grading), five error categories (autoTag + userTag), attempts saved in Supabase (they feed the Review Report), Login/Account.
- REMOVED in v2 (approved by me on 2026-11-16, no separate approval needed): speed control; US/UK accents, Compare accents, Google Cloud TTS and the accent MP3 files; real-time competition (rooms, live leaderboard, Supabase Realtime); the 5 sample clips and their backup; the Part 1 / Part 2 idea; History, Progress, Notebook and its 1/3/7-day schedule (pages, menus and code); the old notebook-based Vocab quiz page. (The new Compete quiz is separate and has its own "listen and type" question type, decided 2026-11-17.)
- Admin page REMOVED (decided 2026-11-16): the clip data lives in one code file, `src/data/clips/walk-with-me.js`. No `clips` / `sentences` tables, no admin rule, no video upload.

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
- Stage 7 (Deploy to Vercel) is on hold. `vercel.json` is already prepared and stays unused. Continue with the other stages; ask me before deploying. The goal is a public URL for my professor, but only at the very end and only when I say so.

## Current status (updated 2026-11-16)
- The v2 design is decided (reference/feature-design-v2.md). Stages 17 (clean-up), 18 (Practice) and 19 (Review Report) are DONE. Practice: Watch the video, unlock levels, Easy / Intermediate / Hard, audio-only dictation, Results. Review Report: biggest weakness at the top, each wrong sentence with the correct sentence left and my answer right, five categories (Speed, New Word, Connected Speech, Accent, Main Idea) with one-tap change, "Watch the full video" with English / Korean / Off subtitles. Compete is a placeholder. Stages 20-22 are not started; waiting for my OK to start Stage 20. I must run `supabase/stage-18.sql` once in the Supabase SQL Editor (adds the `replays` column).
- Database: I must run `supabase/cleanup-v2.sql` ONCE in the Supabase SQL Editor (it drops the old room, notebook, clips and admin parts and keeps users, attempts and reports). Then `supabase/schema.sql` can be run (safe to repeat).
- Video: `public/videos/walk-with-me.mp4` (about 58 s, 18 lines), used directly from the `public/` folder. Not managed through Admin or Supabase.
- Audio: I make `public/audio/walk-with-me.mp3` myself (extracted from the video) and save it there. Claude does not install ffmpeg or extract audio; the app just loads that file.
- Script, timings and Korean: reference/walk-with-me-script.md, walk-with-me-timestamps.json, walk-with-me-admin-paste.md.
- Admin page: decided to REMOVE (2026-11-16). Clip text, timings, Korean and key expressions are kept in `src/data/clips/walk-with-me.js` (filled from reference/walk-with-me-admin-paste.md). Admin pages, `adminApi`, `adminClip`, `ClipEditor`, the `clips` and `sentences` tables, the admin rule, `is_admin` and the storage upload rules go away. `attempts.clip_id` loses its link to the `clips` table.
- Stage 7 (deploy) is on hold. The professor's test replaces the old real-user testing stage.
- If `supabase/schema.sql` changes, I paste the whole file into the Supabase SQL Editor again (it is safe to run twice).
- Project notes (HANDOFF.md, PROGRESS.md, docs/redesign-plan.md, docs/video-brief-for-professor.md) are OLD. reference/feature-design-v2.md is the current plan.

## Product direction (v2, decided 2026-11-16; replaces everything earlier)
- Target user: intermediate/advanced Korean learners, strong in academic vocabulary and reading, weak in fast casual conversation and natural expressions. Complete beginners are NOT the target.
- Main loop: (1) Watch the full video -> (2) audio-only dictation, 3 levels -> (3) Review Report with five categories (the learner can change them). Compete Mode is an expression quiz that reinforces what was heard.
- Error categories stay CS, SP, V, AC, MI (shown as Connected Speech, Speed, New Word, Accent, Main Idea). Auto-guessed as a first diagnosis; the learner's choice is final (store autoTag and userTag).
- Decided NOT to build: speed control, accent choice/compare, TTS, real-time competition, Notebook, review schedule, History, Progress, Time Attack, Australian accent, placement test, AI feedback on writing, same-day review flow, delayed review engine, "Today" hub. (Old stages 17-22 are dropped and replaced.)
- Only one video: Walk With Me. The main screen shows only Practice Mode and Compete Mode.
- The difficulty level is NOT remembered: the learner picks it every visit, and the level buttons unlock again after watching the video each visit.

## Product
A website that trains Korean learners to understand fast, natural English through fill-in-the-blank dictation on one video, Walk With Me (an original law-firm walk-and-talk dialogue with everyday expressions).
Two modes: Practice (watch, then audio-only dictation, then a report) and Compete (expression quiz + leaderboard).
The site must work on laptops and phones (responsive).

## Tech stack
- Frontend: React + Vite, React Router. Plain CSS with CSS variables (no CSS framework).
- Backend (from Stage 8): Supabase (Auth, Postgres database, Storage). Realtime is NOT used in v2 (to be removed).
- Hosting: Vercel.
- Audio: dictation plays one audio file, `public/audio/walk-with-me.mp3`, which I extract from the video myself and save there. No text-to-speech, no accent audio.
- Video: HTML5 <video> for `public/videos/walk-with-me.mp4` (made with Higgsfield). The YouTube player code stays in the project but is not used.

## How to run and set up
- Run the site: `npm run dev` then open http://localhost:5173. Check the build: `npm run build`.
- Helper commands: none any more (`npm run dev`, `npm run build`, `npm run preview` only).
- Secret settings live in the `.env` file (git-ignored; `.env.example` is the template). Names only: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (the public key, safe in the browser). `GOOGLE_TTS_API_KEY`, `TTS_VOICE_US` and `TTS_VOICE_UK` are OLD and will be removed with the TTS feature.
- Database setup in the Supabase SQL Editor: if the project is OLD, run `supabase/cleanup-v2.sql` once first; then run `supabase/schema.sql` (profiles, attempts, blank_results with security rules; safe to run again).
- Tables: profiles, attempts, blank_results (auto_tag + user_tag). Stage 20 adds `quiz_benchmarks` (5 fictional competitors, read-only) and `quiz_results` (my latest quiz result, one row per learner). Row Level Security is on for every table.
- Storage folders `audio` and `videos` in Supabase are no longer used (delete them by hand in Supabase > Storage if you like). The video and the audio are plain files in `public/`.
- How data flows: the clip (sentences, timings, Korean, key expressions) is in `src/data/clips/walk-with-me.js`; the video is `public/videos/walk-with-me.mp4`. Attempts and reports are saved to my account when signed in, and only in this browser (localStorage) when signed out. Compete needs sign-in (Stage 20).
- There is no Admin page any more.
- Testing: there is no automatic test suite in the repo. Changes are checked with the build, the helper scripts, scratch database tests kept outside the project, and manual checks in the browser.

## Design system (v2, dark navy business look; decided 2026-11-16; replaces the old violet/coral design)
The draft is the collage of 7 screens the owner provided (Home, Watch, Choose level, Dictation, Results, Review Report, Compete). Match its mood: dark, calm, professional, like the video.
Colors (all in `src/styles/tokens.css`; dark theme only, no light/dark switch):
- Page background deep navy `#0B1120` with soft blue glows; cards are glass-like (white at 5% opacity, thin light border, 18px corners)
- Text `#F2F4F9`; muted text `#A9B2C6`
- Primary button: WHITE pill with dark text `#0B1120`. Secondary: outlined pill (thin light border, white text)
- Accent blue `#7AA5FF` (links, highlights); success green `#5CCF9F`; error red `#FF8A94`
- Sentence numbers after grading: blue `#5B9DFF` = all blanks correct, red `#FF6B78` = any blank wrong
- Error category tags (muted, tinted background / light text): CS purple, SP orange, V blue, AC green, MI pink (see tokens.css)
- Every text/background pair must keep contrast of at least 4.5:1 (checked: lowest is 5.8:1)
Type: serif headlines and logo (Cormorant Garamond), Inter for UI and body, Noto Sans KR for Korean, all from Google Fonts.
Shape: pill-shaped buttons, thin borders, generous spacing, no decorative circles or bright colors.
Header: slim dark bar, serif "Listening Coach" logo with a small headphones icon, plain text links (Practice, Compete) with an underline on the active one, account pill on the right.
Home: a photo of the two characters (`public/images/hero.webp`) with the serif headline "Listen. Fill in. Improve.", the line "Sharpen your English with real conversations.", and two buttons (Practice Mode, Compete Mode).
Accessibility: visible keyboard focus, real buttons and labels, respect reduced motion, works on phone width.

## Screens (v2)
1. Home: only two big choices, Practice Mode and Compete Mode.
2. Practice: (a) Watch the full video; the level buttons unlock after it has played to the end once (every visit). (b) Choose Easy / Intermediate / Hard. (c) Audio-only dictation: sentence numbers on the left (blue = all blanks correct, red = any blank wrong), the sentence plays once by itself, "Replay" up to 3 times ("Replays left: 3/2/1/0"), Enter moves to the next blank and, on the last blank, submits the sentence. (d) Results: "32 / 40 correct" and a button to the Review Report.
3. Review Report (the only mistake review): top = biggest weakness (from the learner-confirmed categories). Each incorrect sentence: correct sentence on the left, the learner's answer on the right, category chips (auto guess marked "suggested", one tap to change). "Watch the full video" button: normal player controls without the speed option, and a subtitles toggle (English / Korean / Off). No "Save to notebook".
4. Compete: Study page (the 15 key expressions with meanings and example usage), then a 15-question quiz (5 Listen and Type, 5 Meaning Match, 5 Fill in the Gap, mixed, same order for everyone), immediate feedback after each answer (correct/incorrect, the English expression, the Korean meaning if wrong; no changing answers), then Results (12 / 15, percent) and a leaderboard of 6: me (labeled "Latest Result") plus 5 fixed fictional competitors stored in Supabase, ranks 1st-6th, ties share a rank, my row highlighted.
5. Login and Account.
Header menu in v2: logo, Practice, Compete, account. No Library, Vocab quiz, Notebook, History or Progress.

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
      "glosses": { "came": "왔다", "here": "여기" }
    }
  ]
}
```

## Dictation rules (v2)
Three levels (each level up removes hints; hints appear automatically, no hint button). The video is NOT shown during dictation; only the audio of the current sentence plays.

| Level | Blanks per sentence | Hints |
|---|---|---|
| Easy | 1-2 (one blank per word) | Korean meaning above each blank + first letter + letter count |
| Intermediate | every key expression = ONE group (one box per word, each as long as its word) + gonna/wanna and hand-picked `listenWords` | Korean meaning above the group; below it `3 words · 15 letters`; no first letter |
| Hard | same groups + more single words (up to 6 blanks, longest content words, never next to another blank) | none; boxes keep their real length |

- A group (one expression) is graded and scored as ONE item, however many words it has. Easy scores word by word. Scores of different levels are not comparable (approved 2026-11-16). Inside a group, Space or Tab moves to the next word box. Hand-picked extra words live in `listenWords` in the clip data. Touché and Touche are the same.
- Blank priority: key expressions, then small fast words, then connected-speech words, then other content words. Use a seeded random so the same sentence and level always give the same blanks.
- Unlock: the level buttons unlock only after the full video has played to the end once. Not remembered: it starts locked on every visit, and the level is chosen every visit.
- Audio: `public/audio/walk-with-me.mp3` (made by me from the video). Only the current sentence's part (start to end timestamp) plays, always at 1x. It plays once automatically when the sentence appears. Then "Replay" works up to 3 times; the page shows "Replays left: 3/2/1/0" and the button is disabled at 0. Replays used are saved per sentence.
- Enter moves to the next blank (or word box); Enter on the last blank submits the sentence and moves to the next one. The cursor is always ready in the first blank. Never show the Korean translation of the whole sentence during dictation.
- After the last sentence, show the results.
- Sentence numbers on the left: blue = all blanks correct, red = any blank wrong.
- Grading: ignore case and punctuation; accept contractions and equivalents (gonna = going to, I'm = I am); a one-letter typo on 5+ letter words counts as correct but shows "check spelling"; empty = wrong.
- Score = correct blanks / total blanks (for example "32 / 40 correct"). Error categories never change the score.
- Saved to Supabase: level, score, answers, replays used per sentence, mistake categories.

## Five error categories
- CS Connected speech, SP Speed, V Unfamiliar vocabulary, AC Accent, MI Missed the main idea.
- Each wrong or empty blank gets an automatic guess, checked in this order:
  1. CS: reduced spelling (gonna, dija…), two words merged or split, or word cut short by 2+ letters (mount for mountain)
  2. V: key expression (a long word alone is NOT a guess for V: learners know academic words)
  3. MI: 60%+ of a sentence with 3+ blanks missed
  4. AC: clip accent differs from user's accent and answer is within edit distance 2
  5. SP: everything else, including empty
- The review shows all five as chips with the guess marked "suggested"; one tap changes it. Store both autoTag and userTag. One-letter typos count as correct and get no category.
- Main weakness = category with the most misses, based on the learner's final choice (userTag, else autoTag).

## Reference code
/reference/listening-coach-update contains working code for blanks, grading, error tags, SentenceDictation, ReviewPanel and styles. Reuse it instead of rewriting.

## Other features
- Compete Mode (quiz): study page, then 15 mixed questions in the same order for everyone: 5 Listen and Type (hear the clip audio, see only the Korean meaning, type the English expression), 5 Meaning Match (pick the Korean meaning, 4 choices), 5 Fill in the Gap (a NEW sentence not from the clips, Korean meaning always shown below, type the expression). Typed answers: ignore case/punctuation, one-letter typo OK, accepted verb forms listed per question. Questions live in `src/data/compete-quiz.js`. The 15 expressions: got a sec; get cold feet; cut to the chase; on the fence; I can work with; jump on it; back out; leave money on the table; buy it; play hardball; a long shot; drop the ball; I've got this; Says the guy who's...; Touché. (Not in the quiz: Walk with me, pull out of, You're kidding me, this close, don't add up, one step ahead.) The final list is in reference/feature-design-v2.md.
- Quiz retries are unlimited, but only the learner's LATEST completed quiz is saved in Supabase (`quiz_results`, one row per learner, overwritten each time; no history, no personal best; decided 2026-11-17). The retry uses the same fixed question order. The results page shows a short motivational message from real data (for example "You improved your score!", shown only when a previous result exists and the new score is higher, never on the first attempt; or "You're just 1 point behind Sophie!"). The leaderboard compares the learner with 5 predefined fictional competitors (`quiz_benchmarks`, fixed scores, never random); 6 participants; tied scores share a rank; no time tie-break. Not real-time. Practice (listening) scores and quiz scores are kept separate. After Practice, the site encourages the learner to try Compete.
- Removed in v2: Compare accents, speed control, room codes, live leaderboard, Notebook, review schedule, Vocab quiz page, History, Progress.

## Rules that must not be broken
- Never download or re-host YouTube videos; embed only.
- Never copy official Korean subtitles; translations are our own.
- The app never handles money.
- Never put secret keys in frontend code or commit them; use .env files listed in .gitignore. Ask me to paste keys into .env myself.
- Supabase: Row Level Security on every table; users only see their own data (the 5 fictional competitors are read-only and readable by signed-in users).

## Build stages
Done: old stages 1-6, 8-15 and v2 Stage 17. Stage 7 (deploy) on hold. The v2 stages 18-22 are decided but NOT started; do them one at a time and wait for my OK.
17. DONE. Clean-up and removals (one clip from `public/`, no sample clips, no speed / accents / TTS, no History / Progress / Notebook / Vocab quiz, no rooms / Realtime, no Admin; database cleanup in `supabase/cleanup-v2.sql`).
18. DONE. Practice: Watch step, level unlock, 3 levels, audio-only dictation from my mp3, replays, Enter to submit, blue/red sentence numbers, results, save to Supabase (replays per sentence; needs `supabase/stage-18.sql`).
19. DONE. Review Report: correct sentence left / learner answer right, five categories with manual change, weakness at the top, "Watch the full video" with subtitles toggle. Only wrong sentences are listed; the V guess now means key expression only.
20. Compete quiz: study page, 15 mixed questions (3 types), feedback after each, results, leaderboard vs 5 fixed fictional competitors, new `quiz_benchmarks` and `quiz_results` tables, motivational result message.
21. Home with two choices and a simple menu; "try Compete" after Practice.
22. Deploy to a public URL (only when I say so), then the professor's test.

## Known issues and next fixes (2026-11-16)
- Easy-level Korean word meanings (`glosses`) are written for all Walk With Me sentences (Stage 18). I should listen-test the audio in the browser once (the sentence must start and stop at the right places).
- The video file (about 28 MB) and `public/` are not committed to git yet; they must be committed before deploying (decide with me first).
- (Fixed in Stage 19) The V guess no longer marks long words.
- Replays per sentence are saved in `attempts.replays` after I run `supabase/stage-18.sql`.
- The automatic guess for AC (Accent) was removed (the app has one accent). The learner can still pick Accent by hand.
