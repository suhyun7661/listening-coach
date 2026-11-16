// Compete Mode content: the 15 key expressions, the 15 quiz questions in ONE fixed mixed order
// (the same for everyone and for every retry, so scores are fair against the fixed competitors),
// and the 5 fictional competitors.
//
// Question types:
//   listen : hear the clip audio, see ONLY the Korean meaning, type the English expression.
//   meaning: see the English expression, pick the Korean meaning (4 fixed choices).
//   gap    : a NEW sentence (not from the clips) with a gap + the Korean meaning below; type the expression.
// "accept" lists every answer that counts as correct (case, punctuation and one-letter typos are handled by the grader).

export const EXPRESSIONS = [
  { id: 'got-a-sec', en: 'got a sec', ko: '잠깐 시간 돼요?', note: 'Do you have a moment?', sentenceId: 's1' },
  { id: 'cold-feet', en: 'get cold feet', ko: '막판에 겁먹다, 망설이다', note: 'become nervous and want to quit', sentenceId: 's3' },
  { id: 'cut-to-the-chase', en: 'cut to the chase', ko: '본론으로 들어가다', note: 'get to the main point', sentenceId: 's6' },
  { id: 'on-the-fence', en: 'on the fence', ko: '결정을 못 하고 망설이는', note: 'not able to decide', sentenceId: 's7' },
  { id: 'can-work-with', en: 'I can work with', ko: '그 정도면 해볼 만하다', note: "it's not perfect, but it's usable", sentenceId: 's8' },
  { id: 'jump-on-it', en: 'jump on it', ko: '바로 착수하다', note: 'deal with it right away', sentenceId: 's9' },
  { id: 'back-out', en: 'back out', ko: '발을 빼다', note: 'decide not to do something you agreed to', sentenceId: 's11' },
  { id: 'money-on-the-table', en: 'leave money on the table', ko: '챙길 수 있는 이익을 놓치다', note: 'miss a chance to get more', sentenceId: 's11' },
  { id: 'buy-it', en: 'buy it', ko: '그 말을 믿다', note: 'believe it', sentenceId: 's12' },
  { id: 'play-hardball', en: 'play hardball', ko: '강경하게 나가다', note: 'act tough to get what you want', sentenceId: 's13' },
  { id: 'long-shot', en: 'a long shot', ko: '가능성이 낮은 시도', note: 'something unlikely to succeed', sentenceId: 's14' },
  { id: 'drop-the-ball', en: 'drop the ball', ko: '실수하다, 일을 망치다', note: 'make a careless mistake', sentenceId: 's14' },
  { id: 'got-this', en: "I've got this", ko: '제가 알아서 할게요', note: 'I can handle it', sentenceId: 's15' },
  { id: 'says-the-guy', en: "Says the guy who's...", ko: '~인 사람이 할 말은 아니죠', note: "you're one to talk", sentenceId: 's17' },
  { id: 'touche', en: 'Touché', ko: '한 방 먹었네', note: 'you got me (a good comeback)', sentenceId: 's18' },
];

export const QUESTIONS = [
  { id: 'q1', type: 'meaning', expression: 'on-the-fence',
    choices: ['본론으로 들어가다', '결정을 못 하고 망설이는', '강경하게 나가다', '가능성이 낮은 시도'], correct: 1 },
  { id: 'q2', type: 'listen', expression: 'got-a-sec', sentenceId: 's1', accept: ['got a sec'] },
  { id: 'q3', type: 'gap', expression: 'cold-feet',
    before: "You were excited about the job interview, but now you're thinking about canceling it. Are you getting",
    after: '?', accept: ['cold feet'] },
  { id: 'q4', type: 'meaning', expression: 'long-shot',
    choices: ['가능성이 낮은 시도', '강경하게 나가다', '실수하다, 일을 망치다', '발을 빼다'], correct: 0 },
  { id: 'q5', type: 'listen', expression: 'buy-it', sentenceId: 's12', accept: ['buy it'] },
  { id: 'q6', type: 'gap', expression: 'play-hardball',
    before: "The landlord refuses to lower the rent, so we've decided to",
    after: "and say we'll move out if he doesn't.", accept: ['play hardball'] },
  { id: 'q7', type: 'listen', expression: 'got-this', sentenceId: 's15', accept: ["I've got this", 'I have got this', 'I got this'] },
  { id: 'q8', type: 'meaning', expression: 'cut-to-the-chase',
    choices: ['챙길 수 있는 이익을 놓치다', '본론으로 들어가다', '잠깐 시간 돼요?', '결정을 못 하고 망설이는'], correct: 1 },
  { id: 'q9', type: 'gap', expression: 'money-on-the-table',
    before: "If you accept the first offer without asking for anything more, you're",
    after: '.', accept: ['leaving money on the table', 'leave money on the table'] },
  { id: 'q10', type: 'listen', expression: 'jump-on-it', sentenceId: 's9', accept: ['jump on it'] },
  { id: 'q11', type: 'meaning', expression: 'can-work-with',
    choices: ['제가 알아서 할게요', '바로 착수하다', '그 말을 믿다', '그 정도면 해볼 만하다'], correct: 3 },
  { id: 'q12', type: 'gap', expression: 'drop-the-ball',
    before: 'I was supposed to send the invitations on Monday, but I forgot. I really',
    after: 'on that one.', accept: ['dropped the ball', 'drop the ball'] },
  { id: 'q13', type: 'listen', expression: 'touche', sentenceId: 's18', accept: ['Touché'] },
  { id: 'q14', type: 'meaning', expression: 'says-the-guy',
    choices: ['잠깐 시간 돼요?', '막판에 겁먹다, 망설이다', '~인 사람이 할 말은 아니죠', '한 방 먹었네'], correct: 2 },
  { id: 'q15', type: 'gap', expression: 'back-out',
    before: 'We planned the trip together, but Mina',
    after: 'at the last minute because she was too busy.', accept: ['backed out', 'pulled out', 'backs out'] },
];

// The 5 fictional competitors. The same scores are stored in Supabase (table quiz_benchmarks,
// see supabase/stage-20.sql); this copy is only the backup if the table cannot be reached.
export const COMPETITORS = [
  { name: 'Minjun K.', score: 14 },
  { name: 'Sophie L.', score: 12 },
  { name: 'Daniel P.', score: 11 },
  { name: 'Hana S.', score: 11 },
  { name: 'Tomas R.', score: 8 },
];

export const QUIZ_TOTAL = QUESTIONS.length;
