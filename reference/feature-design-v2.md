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

## 5. Compete Mode (a quiz, not a race)
- **Study page:** the 15 quiz expressions with meanings and example usage.
- **Quiz:** a fixed set of 15 questions, in the same order for everyone. Each question: pick the correct meaning (Korean choices; the wrong choices are meanings of other expressions).
- **Leaderboard:** scores saved in Supabase. Only each user's FIRST attempt counts. Ties go to the faster time. It is not real-time: it loads the saved scores.
- Practice (listening) scores and quiz scores are kept separate.
- After Practice, the site encourages the learner to try Compete.

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
