// Sample clip. Sentences are invented practice lines, not real film dialogue.
// videoId and start/end times are placeholders until the real clip is chosen (Stage 4 / Admin).
const clip = {
  id: 'holiday-pub-01',
  source: 'youtube',
  videoId: 'PLACEHOLDER_HOLIDAY',
  title: 'The Holiday – Pub scene',
  accent: 'UK',
  difficulty: 4,
  contextKo: '아이리스가 펍에서 처음 만난 사람과 이야기하는 장면이에요.',
  sentences: [
    {
      id: 's1', start: 2.0, end: 3.8,
      text: "I didn't plan it.",
      ko: '계획한 건 아니었어요.',
      keyWords: [],
      glosses: { plan: '계획하다', "didn't": '~하지 않았다' },
    },
    {
      id: 's2', start: 4.2, end: 6.9,
      text: 'I just came here on a whim.',
      ko: '그냥 즉흥적으로 여기 온 거예요.',
      keyWords: [{ word: 'on a whim', ko: '충동적으로, 별 계획 없이', note: 'Used for a sudden decision with no plan' }],
      glosses: { came: '왔다', here: '여기', just: '그냥' },
    },
    {
      id: 's3', start: 7.3, end: 9.7,
      text: 'She sat down by the window.',
      ko: '그녀는 창가에 앉았어요.',
      keyWords: [],
      glosses: { sat: '앉았다', window: '창문', down: '아래로' },
    },
    {
      id: 's4', start: 10.1, end: 12.7,
      text: 'Did you see the match last night?',
      ko: '어젯밤 경기 봤어요?',
      keyWords: [],
      glosses: { match: '경기', see: '보다', last: '지난', night: '밤' },
    },
    {
      id: 's5', start: 13.1, end: 16.0,
      text: 'Honestly, I could use a proper cup of tea.',
      ko: '솔직히 제대로 된 차 한 잔이 간절해요.',
      keyWords: [{ word: 'could use', ko: '~이 있으면 좋겠다, ~이 필요하다', note: 'A casual way to say you need or want something' }],
      glosses: { honestly: '솔직히', proper: '제대로 된', cup: '잔', tea: '차' },
    },
    {
      id: 's6', start: 16.4, end: 19.2,
      text: "We're gonna be late if we don't leave soon.",
      ko: '곧 안 나가면 우리 늦을 거예요.',
      keyWords: [],
      glosses: { gonna: '~할 것이다 (going to)', late: '늦은', leave: '떠나다', soon: '곧' },
    },
    {
      id: 's7', start: 19.6, end: 22.5,
      text: "He's been pulling my leg all evening.",
      ko: '그는 저녁 내내 저를 놀리고 있었어요.',
      keyWords: [{ word: 'pulling my leg', ko: '놀리다, 장난치다', note: 'Joking with someone, often by telling them something untrue' }],
      glosses: { evening: '저녁', all: '내내' },
    },
    {
      id: 's8', start: 22.9, end: 25.8,
      text: "I'll give you a ring when I get there.",
      ko: '도착하면 전화할게요.',
      keyWords: [{ word: 'give you a ring', ko: '전화하다', note: 'British way to say "call you"' }],
      glosses: { there: '거기', get: '도착하다', when: '~할 때' },
    },
    {
      id: 's9', start: 26.2, end: 28.7,
      text: "It's a bit chilly, isn't it?",
      ko: '좀 쌀쌀하지 않아요?',
      keyWords: [{ word: 'a bit', ko: '약간, 조금', note: 'Very common in British English' }],
      glosses: { chilly: '쌀쌀한' },
    },
    {
      id: 's10', start: 29.1, end: 31.8,
      text: 'Cheers, mate. I owe you one.',
      ko: '고마워, 친구. 내가 신세 졌네.',
      keyWords: [{ word: 'I owe you one', ko: '신세 졌어요, 나중에 갚을게요', note: 'Said after someone does you a favour' }],
      glosses: { cheers: '고마워 (영국식)', mate: '친구', owe: '빚지다' },
    },
  ],
};

export default clip;
