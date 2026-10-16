// Sample clip. Sentences are invented practice lines, not real film dialogue.
// videoId and start/end times are placeholders until the real clip is chosen.
const clip = {
  id: 'intern-01',
  source: 'youtube',
  videoId: 'PLACEHOLDER_INTERN',
  title: 'The Intern – First day at work',
  accent: 'US',
  difficulty: 3,
  contextKo: '인턴 첫날, 선배가 사무실을 안내해 주며 이야기하는 장면이에요.',
  sentences: [
    {
      id: 's1', start: 1.5, end: 4.2,
      text: 'Welcome aboard. Let me show you around.',
      ko: '환영해요. 제가 사무실을 구경시켜 줄게요.',
      keyWords: [{ word: 'show you around', ko: '둘러보며 안내해 주다', note: 'Used when guiding someone through a new place' }],
      glosses: { welcome: '환영하다', aboard: '합류한' },
    },
    {
      id: 's2', start: 4.6, end: 7.0,
      text: 'Your desk is right next to the window.',
      ko: '당신 책상은 창문 바로 옆이에요.',
      keyWords: [],
      glosses: { desk: '책상', right: '바로', next: '옆', window: '창문' },
    },
    {
      id: 's3', start: 7.4, end: 9.8,
      text: 'Feel free to ask me anything.',
      ko: '뭐든 편하게 물어보세요.',
      keyWords: [{ word: 'feel free to', ko: '편하게 ~하세요', note: 'A polite way to give permission' }],
      glosses: { ask: '묻다', anything: '무엇이든' },
    },
    {
      id: 's4', start: 10.2, end: 13.3,
      text: 'We usually start the day with a quick meeting.',
      ko: '우리는 보통 짧은 회의로 하루를 시작해요.',
      keyWords: [],
      glosses: { usually: '보통', start: '시작하다', quick: '짧은, 빠른', meeting: '회의' },
    },
    {
      id: 's5', start: 13.7, end: 16.3,
      text: 'Can you send me that report by noon?',
      ko: '그 보고서 정오까지 보내 줄 수 있어요?',
      keyWords: [],
      glosses: { send: '보내다', report: '보고서', noon: '정오' },
    },
    {
      id: 's6', start: 16.7, end: 19.8,
      text: "I'm kind of nervous about my first project.",
      ko: '첫 프로젝트가 좀 긴장돼요.',
      keyWords: [{ word: 'kind of', ko: '약간, 좀', note: 'Often sounds like "kinda" in fast speech' }],
      glosses: { nervous: '긴장한', first: '첫 번째', project: '프로젝트' },
    },
    {
      id: 's7', start: 20.2, end: 22.9,
      text: "Don't worry, you'll get the hang of it.",
      ko: '걱정 마요, 곧 요령을 익힐 거예요.',
      keyWords: [{ word: 'get the hang of it', ko: '요령을 익히다', note: 'Becoming comfortable with something new' }],
      glosses: { worry: '걱정하다' },
    },
    {
      id: 's8', start: 23.3, end: 25.8,
      text: "Let's grab lunch together later.",
      ko: '나중에 같이 점심 먹어요.',
      keyWords: [{ word: 'grab lunch', ko: '간단히 점심을 먹다', note: '"Grab" means to get food quickly and casually' }],
      glosses: { together: '함께', later: '나중에' },
    },
  ],
};

export default clip;
