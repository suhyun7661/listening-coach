// Sample data for the static Stage 2 screens. Real clip files come in Stage 3.

export const user = { name: '봉수현', initial: '수' };

export const weaknessCounts = [
  { id: 'SP', count: 7, label: 'speed' },
  { id: 'V', count: 6, label: 'new word' },
  { id: 'CS', count: 1, label: 'connected' },
  { id: 'AC', count: 0, label: 'accent' },
  { id: 'MI', count: 0, label: 'main idea' },
];

export const categoryNames = {
  CS: 'connected',
  SP: 'speed',
  V: 'new word',
  AC: 'accent',
  MI: 'main idea',
};

export const clips = [
  { id: 'holiday-pub-01', title: 'The Holiday – Pub scene', source: 'youtube', accent: 'UK', level: 4, length: '0:52', color: '#5b3df5' },
  { id: 'intern-01', title: 'The Intern – First day at work', source: 'youtube', accent: 'US', level: 3, length: '0:45', color: '#2f7beb' },
  { id: 'cafe-01', title: 'Café small talk', source: 'file', accent: 'US', level: 2, length: '0:30', color: '#12a57c' },
  { id: 'interview-01', title: 'Job interview', source: 'file', accent: 'UK', level: 5, length: '1:05', color: '#8b44ee' },
  { id: 'directions-01', title: 'Asking for directions', source: 'file', accent: 'US', level: 1, length: '0:25', color: '#0e9aa7' },
  { id: 'airport-01', title: 'Airport check-in', source: 'file', accent: 'UK', level: 3, length: '0:40', color: '#3d5afe' },
];

export const sourceLabel = { youtube: 'YouTube', file: 'Original video' };

export const practiceSample = {
  title: 'The Holiday – Pub scene',
  accent: 'UK',
  level: 3,
  total: 10,
  current: 3,
  done: [1, 2],
  contextKo: '아이리스가 펍에서 처음 만난 사람과 이야기하는 장면이에요.',
};

export const reviewSample = {
  title: 'The Holiday – Pub scene',
  percent: 72,
  correct: 13,
  total: 18,
  level: 3,
  speed: '0.75x',
  misses: [
    { id: 'SP', count: 3 },
    { id: 'V', count: 1 },
    { id: 'CS', count: 1 },
  ],
  rows: [
    { n: '01', before: 'I didn’t plan it.', allCorrect: true, ko: '계획한 건 아니었어요.' },
    {
      n: '02',
      before: 'I just came here on a',
      wrong: 'wheel',
      right: 'whim',
      after: '.',
      tag: 'V',
      ko: '그냥 즉흥적으로 여기 온 거예요.',
      note: 'on a whim = 충동적으로, 별 계획 없이. Used for a sudden decision with no plan.',
    },
    {
      n: '03',
      before: 'She',
      wrong: '(empty)',
      right: 'sat',
      after: 'down by the window.',
      tag: 'SP',
      ko: '그녀는 창가에 앉았어요.',
      note: '"sat" is short and unstressed, so it disappears at full speed. Try 0.75x, then 1x.',
    },
    {
      n: '04',
      wrong: 'Dija',
      right: 'Did you',
      after: 'see the match last night?',
      tag: 'CS',
      ko: '어젯밤 경기 봤어요?',
      note: '"Did you" often sounds like "didja" in fast speech.',
    },
  ],
};

export const quizSample = {
  number: 3,
  total: 8,
  expression: 'on a whim',
  example: ['She booked the trip ', 'on a whim', '.'],
  options: ['충동적으로, 별 계획 없이', '마지못해, 억지로', '오랫동안 계획해서', '친구의 부탁으로'],
  selected: 0,
  due: [
    { text: 'enlist someone’s help', tag: 'V' },
    { text: 'on a whim', tag: 'V' },
    { text: 'routine', tag: 'SP' },
    { text: 'Did you (didja)', tag: 'CS' },
  ],
};

export const competeSample = {
  code: '482 615',
  label: 'Loser buys lunch',
  level: 4,
  accent: 'UK',
  secondsLeft: '0:42',
  playsLeft: 2,
  rules: ['1x speed only', 'Max 3 plays', '60 seconds', 'No hints or translation', 'One attempt'],
  players: [
    { rank: 1, name: '민지', score: '100%', plays: 2, time: '0:38', best: true },
    { rank: 2, name: '준호', score: '67%', plays: 3, time: '0:51' },
    { rank: 3, name: '서연', score: '67%', plays: 3, time: '0:57' },
  ],
};

export const notebookSample = [
  { word: 'on a whim', ko: '충동적으로, 별 계획 없이', tag: 'V', clip: 'The Holiday – Pub scene', next: 'Today' },
  { word: 'enlist someone’s help', ko: '~의 도움을 구하다', tag: 'V', clip: 'The Intern – First day at work', next: 'Today' },
  { word: 'sat', ko: '앉았다', tag: 'SP', clip: 'The Holiday – Pub scene', next: 'In 3 days' },
  { word: 'Did you (didja)', ko: '너 ~했니', tag: 'CS', clip: 'The Holiday – Pub scene', next: 'In 7 days' },
];
