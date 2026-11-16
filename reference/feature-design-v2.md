# Listening Coach: Feature Design v2 (final decisions)

Written 2026-11-16, updated the same day (second round of decisions). This replaces the old plan (docs/redesign-plan.md, old stages 17-22) wherever they differ.
Context: a university assignment. The professor opens one public URL and tests the site alone. Simple and reliable beats clever.

## 1. General
- ONE video only: **Walk With Me** (`public/videos/walk-with-me.mp4`, about 58 s, 18 lines). It is used directly from the `public/` folder. Admin and Supabase do not manage the video file. The old Part 1 / Part 2 split is dropped. The 5 sample clips are removed.
- The main screen shows only two choices: **Practice Mode** and **Compete Mode**. Nothing else on it.
- Header menu: logo, Practice, Compete, account.
- No speed adjusting anywhere. Audio and video always play at 1x. Remove every speed button.
- No accent adjusting anywhere. Remove "Compare accents" / "Compare US / UK", the TTS accent audio feature, Google Cloud TTS, the US/UK MP3 files and the `ttsAudio` field.
- No real-time competition and no Supabase Realtime. Remove room codes, the live leaderboard and the code behind them.
- The **Review Report is the only way to review mistakes**. There is no learning history and no progress tracking.

## 2. Approved removals (owner approved all of them on 2026-11-16; no separate approval needed)
- Speed buttons and speed saving.
- US/UK accents, Compare accents, TTS script (`make-audio`), `generated-audio`, `audio.js`, `speech.js`, `ttsAudio`, the Google key setting, the `make:audio` command.
- Rooms, live leaderboard, Realtime, `CompeteRoom`, `useRoomBoard`, the old Competing code and the four `challenge_*` tables with their functions.
- The 5 sample clips and the sample-clip backup (`src/data/clips`, `seed.sql`, `check:clips`, `make:seed`).
- History page, Progress page, Notebook page, the 1/3/7-day review schedule (`spaced.js`, `notebook.js`, `useNotebook.js`, `notebook_items` table), their menu items, and "Save to notebook" in the Review Report.
- The notebook-based Vocab quiz page and its "listen and type" question type. (The Compete quiz is the only quiz.)
- `PracticeChoose.jsx` (the video chooser; with one video it is not needed).
- The Admin page (decided 2026-11-16): `Admin`, `AdminClip`, `ClipEditor`, `adminApi`, `adminClip`, the `clips` and `sentences` tables, the admin rule, `is_admin`, the storage upload rules, and the "make my account admin" step. See section 7.

## 3. Practice Mode
1. **Watch.** The learner watches the full video first. The level buttons unlock only after the video has played to the end once. This is not remembered: it starts locked on every visit.
2. **Levels (3), chosen on every visit** (the choice is not remembered).

| Level | Blanks per sentence | Hints |
|---|---|---|
| Easy | 1-2 | Korean meaning + first letter + letter count |
| Intermediate | 3-4 | Korean meaning for key expressions only + letter count |
| Hard | about half of the words | none |

   Short sentences get the lower number of blanks (to confirm).

3. **Dictation is audio only** (the video is not shown).
   - The audio file is `public/audio/walk-with-me.mp3`. **The owner extracts it from the video and saves it there.** The app only loads the file. Claude does not install ffmpeg or extract audio.
   - Only the current sentence's part is played (start to end timestamp).
   - The sentence plays once automatically when it appears. Then the learner can press **Replay** up to 3 times. The page shows "Replays left: 3 / 2 / 1 / 0", and the button is disabled at 0.
   - **Enter** submits the current sentence and moves to the next one.
   - Sentence numbers on the left turn **blue** (all blanks correct) or **red** (any blank wrong). A one-letter typo counts as correct but shows "check spelling".
4. **Results.** Total correct blanks (for example "32 / 40 correct") and a button to the Review Report.
5. **Saved in Supabase** for each practice: level, score, answers, replays used per sentence, mistake categories. (Saved so the Review Report can show it; there is no history page.)

## 4. Review Report
- **Top:** the learner's biggest weakness, based on the final categories the learner confirmed.
- **Each incorrect sentence:** the correct sentence on the left, the learner's answer on the right.
- **Five categories:** Speed (SP), New Word (V), Connected Speech (CS), Accent (AC), Main Idea (MI). Each mistake gets an automatic guess. The learner can change it. The final category is the learner's choice. The guess is a first diagnosis, not a final judgment.
- **"Watch the full video" button:** opens the full video with normal player controls (the playback speed option is hidden) and an optional subtitles toggle: English / Korean / Off.

## 5. Compete Mode (a vocabulary game, not a race)
Updated 2026-11-17 (owner decisions; replaces the old "15 meaning-choice questions" plan). Goal: feel like a competitive vocabulary game while still teaching. It tests three abilities: listening recognition, meaning comprehension, and contextual expression recall.

**Flow:** Study page -> Quiz (15 questions, feedback after each) -> Results and leaderboard.

- **Study page:** the 15 quiz expressions with meanings and example usage.
- **Quiz: 15 questions, three types, 5 of each.** The questions are mixed (not grouped by type). The mixed order is chosen once and stored in the data file. Every learner gets the same questions in the same order, and retries use the same order too, so results are fair against the fixed competitors (owner decision 2026-11-17).
  1. **Listen and Type (5):** the learner hears the real clip audio and sees ONLY the Korean meaning. No English sentence and no blanks are shown. The learner types the English expression. The audio plays once by itself, then up to 2 replays.
  2. **Meaning Match (5):** the learner sees the English expression and picks the Korean meaning from 4 choices (wrong choices are meanings of other quiz expressions).
  3. **Fill in the Gap (5):** a NEW English sentence (never taken from the clips) with a gap. The Korean meaning is always shown below the sentence; it clarifies the intended expression without giving the English answer. The learner TYPES the expression (no multiple choice). This tests whether the learner can use the expression in an unfamiliar situation.
- **Typed answers:** ignore case, punctuation and extra spaces; a one-letter typo on a long answer counts as correct; accepted verb forms are listed per question (for example "dropped the ball" and "drop the ball"). Touche = Touché. Each question has a short list of accepted answers in the data file.
- **Immediate feedback after every question:** shows Correct or Incorrect, reveals the correct English expression, and (if incorrect) also shows its Korean meaning. The learner reads it and presses Next. Once submitted, an answer cannot be changed.
- **Results:** score such as 12 / 15 and the accuracy percentage (1 point per question; the same scoring and the same questions for everyone).
- **Short motivational message on the results page** (based on real data: the learner's score, the 5 benchmark scores and, if there is one, the previous saved result, which is read BEFORE it is overwritten). Examples: "You improved your score!" (shown ONLY when a previous saved result exists and the new score is higher; never on the first attempt, never when the score is the same or lower), "You're just 1 point behind Sophie!", "You beat 3 of 5 competitors", "Perfect score!". "Personal best" messages are not possible because no history is kept.
- **Leaderboard:** the learner is compared with **5 predefined fictional competitors** (6 participants in total). The leaderboard shows rank 1st to 6th, names and scores, and highlights the learner's row, which is labeled "Latest Result" (only the most recent score is stored). Tied scores share a rank (for example 1st, 2nd, 2nd, 4th). There is no time tie-break. Competitors are never generated or randomized; their scores are the same for every session and every user. They are only a motivating benchmark, not real users.
- **Server storage (Supabase):**
  - `quiz_benchmarks`: the 5 fictional competitors (name, score out of 15, order). Read-only for signed-in learners; only changed by SQL.
  - `quiz_results`: ONE row per learner holding only the latest completed quiz (score, total, percent, answers, date). A new completed quiz overwrites it. No attempt history and no personal-best record (decided 2026-11-17: the app is for a limited number of demonstrations, not long-term tracking). Row Level Security: a learner sees and writes only their own row.
  - Unlimited retries. After each completed quiz the learner's score is compared with the same 5 fixed competitors and the leaderboard is shown.
- Practice (listening) scores and quiz scores are kept separate.
- After Practice, the site encourages the learner to try Compete.

### The fictional competitors (approved by the owner 2026-11-17; scores are fixed and stored permanently in Supabase)
| Name | Score |
|---|---|
| Minjun K. | 14 / 15 |
| Sophie L. | 12 / 15 |
| Daniel P. | 11 / 15 |
| Hana S. | 11 / 15 |
| Tomas R. | 8 / 15 |

### The 15 expressions (proposed; kept "Touché" at the owner's request)
| # | Expression | Korean meaning |
|---|---|---|
| 1 | got a sec | 잠깐 시간 돼요? |
| 2 | get cold feet | 막판에 겁먹다, 망설이다 |
| 3 | cut to the chase | 본론으로 들어가다 |
| 4 | on the fence | 결정을 못 하고 망설이는 |
| 5 | I can work with | 그 정도면 해볼 만하다 |
| 6 | jump on it | 바로 착수하다 |
| 7 | back out | 발을 빼다 |
| 8 | leave money on the table | 챙길 수 있는 이익을 놓치다 |
| 9 | buy it | 그 말을 믿다 |
| 10 | play hardball | 강경하게 나가다 |
| 11 | a long shot | 가능성이 낮은 시도 |
| 12 | drop the ball | 실수하다, 일을 망치다 |
| 13 | I've got this | 제가 알아서 할게요 |
| 14 | Says the guy who's... | ~인 사람이 할 말은 아니죠 |
| 15 | Touché | 한 방 먹었네 |

Left out (6): Walk with me, pull out of, You're kidding me, this close, don't add up, one step ahead. Reasons: easy to guess from the words, or very common in academic English ("don't add up"), or nearly the same as another one ("pull out of" is close to "back out"). Example usage for the study page comes from the script.

## 6. Stays the same
- Login (Supabase Auth), profiles, security rules (RLS) on every table.
- Five error categories, saved as `auto_tag` and `user_tag`.
- Dictation engine (blanks, hints, grading), design system (violet / coral / yellow / indigo / lavender), responsive layout.
- Local only until the owner says "deploy". The goal is a public Vercel URL for the professor, at the very end.

## 7. Admin page: removed (decided 2026-11-16)
**Why:** it was the only tool that put a clip into the database. The video now comes from `public/`, there is one fixed clip, its text is already written (reference/walk-with-me-admin-paste.md), and nobody adds clips later.

**What replaces it:** one code file, `src/data/clips/walk-with-me.js`, in the same clip format the app already uses (sentences, timings, Korean, key expressions). To fix a typo, edit the file and publish again.

**What goes away:** the Admin pages (about 550 lines), `adminApi`, `adminClip`, `ClipEditor`, the `clips` and `sentences` tables, the admin rule and `is_admin`, the storage upload rules, and the "make my account admin" setup step. `attempts.clip_id` no longer points to a `clips` table.

## 8. Still open
- Header menu is proposed as Practice, Compete, account.
- Blank counts for short sentences (lower number).
- Final check of the 15 expressions.
