// Example clip. Sentences are invented sample lines, not real film dialogue.
// New field: "glosses" = Korean meaning for single words that may become blanks.
// Level 1-2 show these above blanks; key expressions use keyWords[].ko instead.
const sampleClip = {
  id: 'holiday-pub-01',
  source: 'youtube',
  videoId: 'abc123',
  title: 'The Holiday – Pub scene',
  accent: 'UK',
  contextKo: '아이리스가 펍에서 처음 만난 사람과 이야기하는 장면이에요.',
  sentences: [
    {
      id: 's1',
      start: 10.2,
      end: 12.0,
      text: "I didn't plan it.",
      ko: '계획한 건 아니었어요.',
      glosses: { plan: '계획하다', "didn't": '~하지 않았다' },
    },
    {
      id: 's2',
      start: 12.4,
      end: 15.1,
      text: 'I just came here on a whim.',
      ko: '그냥 즉흥적으로 여기 온 거예요.',
      keyWords: [{ word: 'on a whim', ko: '충동적으로, 별 계획 없이', note: 'Used for a sudden decision with no plan' }],
      glosses: { came: '왔다', here: '여기', just: '그냥' },
    },
    {
      id: 's3',
      start: 15.6,
      end: 18.0,
      text: 'She sat down by the window.',
      ko: '그녀는 창가에 앉았어요.',
      glosses: { sat: '앉았다', window: '창문', down: '아래로' },
    },
    {
      id: 's4',
      start: 18.4,
      end: 21.0,
      text: 'Did you see the match last night?',
      ko: '어젯밤 경기 봤어요?',
      glosses: { match: '경기', see: '보다', last: '지난', night: '밤' },
    },
  ],
};

export default sampleClip;
