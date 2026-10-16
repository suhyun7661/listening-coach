// Sample clip. Sentences are invented practice lines.
// For source "file", videoId will hold the Supabase Storage URL (Stage 13). Placeholder for now.
const clip = {
  id: 'directions-01',
  source: 'file',
  videoId: 'PLACEHOLDER_DIRECTIONS_VIDEO_URL',
  title: 'Asking for directions',
  accent: 'US',
  difficulty: 1,
  contextKo: '길에서 지나가는 사람에게 기차역 가는 길을 묻는 장면이에요.',
  sentences: [
    {
      id: 's1', start: 1.0, end: 3.8,
      text: 'Excuse me, how do I get to the station?',
      ko: '실례합니다, 역에는 어떻게 가나요?',
      keyWords: [{ word: 'get to', ko: '~에 도착하다, ~에 가다', note: 'The usual way to ask how to reach a place' }],
      glosses: { excuse: '실례하다', station: '역', how: '어떻게' },
    },
    {
      id: 's2', start: 4.2, end: 6.4,
      text: 'Go straight for two blocks.',
      ko: '두 블록 곧장 가세요.',
      keyWords: [],
      glosses: { straight: '곧장', blocks: '블록, 구역', two: '둘' },
    },
    {
      id: 's3', start: 6.8, end: 9.0,
      text: 'Then turn left at the bank.',
      ko: '그다음 은행에서 왼쪽으로 도세요.',
      keyWords: [],
      glosses: { then: '그다음', turn: '돌다', left: '왼쪽', bank: '은행' },
    },
    {
      id: 's4', start: 9.4, end: 12.4,
      text: "It's on your right, next to the bakery.",
      ko: '오른쪽에 있어요, 빵집 옆이에요.',
      keyWords: [],
      glosses: { right: '오른쪽', next: '옆', bakery: '빵집' },
    },
    {
      id: 's5', start: 12.8, end: 14.6,
      text: 'Is it far from here?',
      ko: '여기서 멀어요?',
      keyWords: [],
      glosses: { far: '먼', from: '~에서', here: '여기' },
    },
    {
      id: 's6', start: 15.0, end: 18.0,
      text: "No, it's about a five minute walk.",
      ko: '아니요, 걸어서 5분 정도예요.',
      keyWords: [],
      glosses: { about: '약', minute: '분', walk: '걷기' },
    },
  ],
};

export default clip;
