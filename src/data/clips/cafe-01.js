// Sample clip. Sentences are invented practice lines.
// For source "file", videoId will hold the Supabase Storage URL (Stage 13). Placeholder for now.
const clip = {
  id: 'cafe-01',
  source: 'file',
  videoId: 'PLACEHOLDER_CAFE_VIDEO_URL',
  title: 'Café small talk',
  accent: 'US',
  difficulty: 2,
  contextKo: '카페에서 주문하고 점원과 가볍게 이야기하는 장면이에요.',
  sentences: [
    {
      id: 's1', start: 1.0, end: 3.0,
      text: 'Hi, what can I get for you?',
      ko: '안녕하세요, 뭘 드릴까요?',
      keyWords: [],
      glosses: { what: '무엇', can: '~할 수 있다', get: '가져다주다' },
    },
    {
      id: 's2', start: 3.4, end: 5.6,
      text: "I'll have a medium latte, please.",
      ko: '미디엄 라테 한 잔 주세요.',
      keyWords: [{ word: "I'll have", ko: '~로 주세요', note: 'The usual way to order food or drinks' }],
      glosses: { medium: '중간 크기', latte: '라테', please: '부탁합니다' },
    },
    {
      id: 's3', start: 6.0, end: 8.8,
      text: 'Would you like anything to eat with that?',
      ko: '같이 드실 음식도 필요하세요?',
      keyWords: [],
      glosses: { would: '~하시겠어요', anything: '무엇이든', eat: '먹다' },
    },
    {
      id: 's4', start: 9.2, end: 11.4,
      text: 'Just a blueberry muffin, thanks.',
      ko: '블루베리 머핀 하나만 주세요, 고마워요.',
      keyWords: [],
      glosses: { just: '그냥, 딱', blueberry: '블루베리', muffin: '머핀' },
    },
    {
      id: 's5', start: 11.8, end: 14.6,
      text: "That'll be six dollars and fifty cents.",
      ko: '6달러 50센트입니다.',
      keyWords: [{ word: "That'll be", ko: '합계는 ~입니다', note: 'Cashiers say this before the price' }],
      glosses: { six: '여섯', dollars: '달러', cents: '센트' },
    },
    {
      id: 's6', start: 15.0, end: 17.4,
      text: 'Do you want to sit by the door?',
      ko: '문 옆에 앉고 싶어요?',
      keyWords: [],
      glosses: { want: '원하다', sit: '앉다', door: '문' },
    },
    {
      id: 's7', start: 17.8, end: 20.6,
      text: "It's pretty busy here this morning.",
      ko: '오늘 아침엔 여기 꽤 붐비네요.',
      keyWords: [],
      glosses: { pretty: '꽤', busy: '붐비는', morning: '아침' },
    },
    {
      id: 's8', start: 21.0, end: 23.8,
      text: 'Have a great day, see you tomorrow!',
      ko: '좋은 하루 보내세요, 내일 봐요!',
      keyWords: [],
      glosses: { great: '아주 좋은', day: '하루', tomorrow: '내일' },
    },
  ],
};

export default clip;
