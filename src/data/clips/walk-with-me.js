// The one and only clip: "Walk With Me" (an original law-firm dialogue, made with Higgsfield).
// The video is a plain file in the public/ folder. Times are in seconds (from reference/walk-with-me-admin-paste.md).
// "glosses" (Korean word meanings for the Easy level) are added in the Practice stage.
const clip = {
  id: 'walk-with-me',
  source: 'file',
  videoId: '/videos/walk-with-me.mp4',
  title: 'Walk With Me',
  accent: 'US',
  difficulty: 4,
  contextKo: '고객이 거래를 포기하려 하자, 신입 변호사 마야가 바쁜 상사 라이언에게 해결책을 보고하는 장면이에요.',
  sentences: [
    {
      id: 's1', start: 3.4, end: 5.9,
      text: "Ryan, got a sec? We've got a problem.",
      ko: '라이언, 잠깐 시간 돼요? 문제가 생겼어요.',
      keyWords: [{ word: 'got a sec', ko: '잠깐 시간 돼요?', note: 'Do you have a moment?' }],
      glosses: {},
    },
    {
      id: 's2', start: 6.0, end: 8.0,
      text: "Walk with me. I'm already late. What's going on?",
      ko: '걸으면서 얘기해. 이미 늦었어. 무슨 일인데?',
      keyWords: [{ word: 'Walk with me', ko: '걸으면서 얘기하자', note: "Talk while we walk (I'm busy)" }],
      glosses: {},
    },
    {
      id: 's3', start: 8.3, end: 10.6,
      text: "Henderson's getting cold feet. He wants to pull out of the deal.",
      ko: '헨더슨이 겁을 먹었어요. 거래에서 빠지고 싶대요.',
      keyWords: [
        { word: 'getting cold feet', ko: '막판에 겁먹다, 망설이다', note: 'become nervous and want to quit' },
        { word: 'pull out of', ko: '~에서 빠지다, 철회하다', note: 'stop being part of something' },
      ],
      glosses: {},
    },
    {
      id: 's4', start: 10.8, end: 12.8,
      text: "You're kidding me. We're this close to closing.",
      ko: '농담이지? 계약 성사가 코앞인데.',
      keyWords: [
        { word: "You're kidding me", ko: '말도 안 돼, 농담이지?', note: "I can't believe it" },
        { word: 'this close', ko: '거의 다 와서, 코앞에', note: 'very near' },
      ],
      glosses: {},
    },
    {
      id: 's5', start: 12.9, end: 15.1,
      text: "I know. He says the numbers don't add up.",
      ko: '알아요. 숫자가 안 맞는대요.',
      keyWords: [{ word: "don't add up", ko: '앞뒤가 안 맞다', note: "don't make sense" }],
      glosses: {},
    },
    {
      id: 's6', start: 15.5, end: 19.3,
      text: "Then let's cut to the chase. Is he bluffing, or is he actually walking?",
      ko: '그럼 본론만 얘기하자. 허세야, 아니면 진짜 떠나는 거야?',
      keyWords: [{ word: 'cut to the chase', ko: '본론으로 들어가다', note: 'get to the main point' }],
      glosses: {},
    },
    {
      id: 's7', start: 20.1, end: 22.3,
      text: "Honestly? I think he's on the fence.",
      ko: '솔직히요? 아직 결정을 못 한 것 같아요.',
      keyWords: [{ word: 'on the fence', ko: '결정을 못 하고 망설이는', note: 'not able to decide' }],
      glosses: {},
    },
    {
      id: 's8', start: 23.3, end: 27.7,
      text: 'Good. On the fence I can work with. Set up a call for ten.',
      ko: '좋아. 망설이는 거라면 해볼 만해. 10시에 통화 잡아.',
      keyWords: [{ word: 'I can work with', ko: '그 정도면 해볼 만하다', note: "it's not perfect, but it's usable" }],
      glosses: {},
    },
    {
      id: 's9', start: 27.9, end: 30.1,
      text: "Already did. I figured you'd wanna jump on it.",
      ko: '벌써 잡았어요. 바로 처리하고 싶어 하실 것 같아서요.',
      keyWords: [{ word: 'jump on it', ko: '바로 착수하다', note: 'deal with it right away' }],
      glosses: {},
    },
    {
      id: 's10', start: 30.7, end: 33.6,
      text: "Look at you, one step ahead. What're you gonna tell him?",
      ko: '이것 봐라, 한발 앞서가네. 그 사람한테 뭐라고 할 건데?',
      keyWords: [{ word: 'one step ahead', ko: '한발 앞서 있는', note: 'thinking before others do' }],
      glosses: {},
    },
    {
      id: 's11', start: 33.9, end: 36.5,
      text: "That if he backs out now, he's leaving money on the table.",
      ko: '지금 발을 빼면 챙길 수 있는 돈을 놓치는 거라고요.',
      keyWords: [
        { word: 'backs out', ko: '발을 빼다', note: 'decide not to do something you agreed to' },
        { word: 'leaving money on the table', ko: '챙길 수 있는 이익을 놓치다', note: 'miss a chance to get more' },
      ],
      glosses: {},
    },
    {
      id: 's12', start: 36.6, end: 38.0,
      text: "And if he doesn't buy it?",
      ko: '그 말을 안 믿으면?',
      keyWords: [{ word: 'buy it', ko: '그 말을 믿다', note: 'believe it' }],
      glosses: {},
    },
    {
      id: 's13', start: 38.2, end: 41.2,
      text: 'Then we play hardball. Their offer expires Friday.',
      ko: '그럼 세게 나가야죠. 상대 측 제안이 금요일에 만료되거든요.',
      keyWords: [{ word: 'play hardball', ko: '강경하게 나가다', note: 'act tough to get what you want' }],
      glosses: {},
    },
    {
      id: 's14', start: 41.8, end: 45.5,
      text: "That's a long shot, but it might work. Don't drop the ball on this one.",
      ko: '가능성은 낮지만 통할 수도 있겠네. 이번 건 실수하지 마.',
      keyWords: [
        { word: 'a long shot', ko: '가능성이 낮은 시도', note: 'something unlikely to succeed' },
        { word: 'drop the ball', ko: '실수하다, 일을 망치다', note: 'make a careless mistake' },
      ],
      glosses: {},
    },
    {
      id: 's15', start: 47.8, end: 49.7,
      text: "I won't. I've got this.",
      ko: '안 해요. 제가 알아서 할게요.',
      keyWords: [{ word: "I've got this", ko: '제가 알아서 할게요', note: 'I can handle it' }],
      glosses: {},
    },
    {
      id: 's16', start: 51.0, end: 54.8,
      text: "I know you do. That's why it's yours. Ten o'clock. Don't be late.",
      ko: '알지. 그래서 네게 맡기는 거야. 10시야. 늦지 마.',
      keyWords: [],
      glosses: {},
    },
    {
      id: 's17', start: 55.0, end: 56.6,
      text: "Says the guy who's already late.",
      ko: '이미 늦은 분이 하실 말씀은 아닌데요.',
      keyWords: [{ word: "Says the guy who's", ko: '~인 사람이 할 말은 아니죠', note: "you're one to talk" }],
      glosses: {},
    },
    {
      id: 's18', start: 56.7, end: 57.9,
      text: 'Touché.',
      ko: '한 방 먹었네.',
      keyWords: [{ word: 'Touché', ko: '한 방 먹었네', note: 'you got me (good comeback)' }],
      glosses: {},
    },
  ],
};

export default clip;
