# Listening Coach: redesign plan (decided 2026-10-20)

## 1. Who it is for
Intermediate and advanced learners. Strong in academic vocabulary and reading. Weak in **fast, casual conversation**
and **natural expressions** (for example "on a whim"). Complete beginners are not the target.

## 2. The learning loop (the whole product in one line)
**Hear it, understand it, use it, remember it.**

1. **Dictation** (Practice): video, speed control, levels, US/UK clips.
2. **Same-day review** (right after dictation, 3 short steps):
   1. **Report**: score, mistakes, likely cause (CS / SP / V / AC / MI), changeable by the learner.
   2. **Expressions**: a card for each missed expression: Meaning, Why (Korean, with English examples), Similar expressions, Example sentences.
   3. **Write**: a short situation prompt, the learner writes one sentence, then sees a **model sentence** and a self-check.
3. **Delayed review** (days later, 1 / 3 / 7 days): same audio, **new blanks**, a meaning quiz, and a writing task with a **new** prompt.

Secondary: **Competing mode** (finished). Not building: Time Attack, Australian accent, placement test, AI feedback.

## 3. What changes in the menu
| Now | New |
|---|---|
| Library | merged into **Practice** (the clip library) |
| Practice | **Practice** |
| (Home page weakness tiles) | **Today** (new home page) |
| Vocab quiz | moved inside **Notebook** (tab "Quiz") |
| Notebook | **Notebook**: expression cards + quiz + my writing |
| History + Progress + report | one **Report** area, reached from Today and from the review flow |
| Compete | **Compete** (unchanged) |

New header: **Today · Practice · Notebook · Compete** (+ account). Four items instead of five.

### Today (new home page)
- "Today's session": one button to continue or start a dictation (suggested clip for your level).
- **Review due**: the delayed-review queue (how many items are due, start button).
- **Finish your review**: shown if the last dictation's writing step is not done.
- Small "My report" card (main weakness, link to Report).

## 4. Screens in the new flow
1. **Practice**: clip library, then dictation (as today).
2. **Review flow** (after Submit), with a step bar: Report, Expressions, Write, Done.
3. **Write step**: for each of up to 3 missed expressions: situation prompt, text box, "Show model sentence", self-check ("I used the expression naturally", "The meaning fits the situation"), Save.
4. **Delayed review**: one due sentence at a time: dictation (same audio, changed blanks), then the expression meaning quiz, then a writing task with a new prompt.
5. **Notebook**: expression cards (four elements), quiz tab, my sentences tab.
6. **Report**: latest report, history, progress charts.

## 5. Delayed review rules
- Same video and audio as the original sentence.
- **First review:** the previously missed expression is blanked again; the other blanks are new.
- **Later reviews:** blanks change every round (round number is part of the random seed). Higher rounds can use fewer hints.
- Schedule: **1, 3, 7 days.** A miss sends the item back to 1 day (as today's word schedule).
- Writing: a **new** prompt for the same expression, not the same one.

## 6. Data changes (all additive; nothing is deleted)
- **Key expression** (inside the clip data, no database change needed for the fields):
  `word, ko (meaning), why (Korean), similar [..], examples [..], prompts [{situation, model}]`
- New table **sentence_reviews**: user, clip, sentence, missed words, round, step, next review date.
- New table **writing_entries**: user, expression, prompt, text, self-check, kind (same-day / delayed), date.
- Both with Row Level Security (users see only their own rows).
- Admin page: key expression form gets the new fields.
- Blank selection: `generateBlanks(sentence, level, { round, mustBlank })`.

## 7. Error analysis changes
- Keep CS, SP, V, AC, MI with automatic guess and learner override (autoTag and userTag stored).
- **V rule fix:** V means casual expressions / phrasal verbs (curated key expressions), not long academic words.
- One short "what to do" tip per category in the report (for example CS: "shadow the sentence").
- Later: show how often learners change each guess, to improve the rules.

## 8. Build order
| Stage | What | Size |
|---|---|---|
| 17 | Expression content (why / similar / examples / prompts) in Admin, notebook cards, auto-add missed expressions. I write Korean notes for the sample clips; you check them. | M |
| 18 | Same-day review flow: Report, Expressions, Write (prompt, model sentence, self-check). New table writing_entries. | M |
| 19 | Delayed review engine: changing blanks, queue (1/3/7 days), delayed dictation, quiz, new writing prompt. New table sentence_reviews. | L |
| 20 | Today hub + new menu + Report area + Quiz inside Notebook. | M |
| 21 | V rule fix, category tips, tag-change statistics. | S |
| 22 | Pilot preparation: the first real videos, then decide about going online (Stage 7), then testing with real users (Stage 16). | S |

## 9. Honest risks
- **Content writing is the bottleneck.** Each expression needs meaning, why, similar expressions, examples and two prompts with model sentences. About 10 minutes each. Start with 10 to 15 expressions.
- **Korean quality.** The "why" notes must be accurate. I will draft the sample ones; a teacher or you should check them.
- **Self-check is weaker than feedback.** The pilot will show whether learners need more.
- **Are Higgsfield voices natural enough?** Test a short sample first.
