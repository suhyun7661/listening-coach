// The one and only clip: "Walk With Me" (an original law-firm dialogue, made with Higgsfield).
// The video is a plain file in the public/ folder. Times are in seconds (from reference/walk-with-me-admin-paste.md).
// "glosses" are Korean word meanings (shown above blanks at the Easy level).
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
      glosses: { 'ryan': '라이언(이름)', 'got': '있다, 생겼다', 'a': '하나의', 'sec': '잠깐', "we've": '우리에게 ~이 있다', 'problem': '문제' },
    },
    {
      id: 's2', start: 6.0, end: 8.0,
      text: "Walk with me. I'm already late. What's going on?",
      ko: '걸으면서 얘기해. 이미 늦었어. 무슨 일인데?',
      keyWords: [{ word: 'Walk with me', ko: '걸으면서 얘기하자', note: "Talk while we walk (I'm busy)" }],
      glosses: { 'walk': '걷다', 'with': '~와 함께', 'me': '나', "i'm": '나는 ~이다', 'already': '이미', 'late': '늦은', "what's": '무엇이 ~인가', 'going': '진행되는', 'on': '~에, 계속' },
    },
    {
      id: 's3', start: 8.3, end: 10.6,
      text: "Henderson's getting cold feet. He wants to pull out of the deal.",
      ko: '헨더슨이 겁을 먹었어요. 거래에서 빠지고 싶대요.',
      keyWords: [
        { word: 'getting cold feet', ko: '막판에 겁먹다, 망설이다', note: 'become nervous and want to quit' },
        { word: 'pull out of', ko: '~에서 빠지다, 철회하다', note: 'stop being part of something' },
      ],
      glosses: { "henderson's": '헨더슨이(~는)', 'getting': '~해지는', 'cold': '차가운', 'feet': '발', 'he': '그는', 'wants': '원한다', 'to': '~하기를', 'pull': '당기다', 'out': '밖으로', 'of': '~에서', 'the': '그', 'deal': '거래' },
    },
    {
      id: 's4', start: 10.8, end: 12.8,
      text: "You're kidding me. We're this close to closing.",
      ko: '농담이지? 계약 성사가 코앞인데.',
      keyWords: [
        { word: "You're kidding me", ko: '말도 안 돼, 농담이지?', note: "I can't believe it" },
        { word: 'this close', ko: '거의 다 와서, 코앞에', note: 'very near' },
      ],
      glosses: { "you're": '너는 ~이다', 'kidding': '농담하는', 'me': '나에게', "we're": '우리는 ~이다', 'this': '이만큼', 'close': '가까운', 'to': '~에', 'closing': '계약 마무리' },
    },
    {
      id: 's5', start: 12.9, end: 15.1,
      text: "I know. He says the numbers don't add up.",
      ko: '알아요. 숫자가 안 맞는대요.',
      keyWords: [{ word: "don't add up", ko: '앞뒤가 안 맞다', note: "don't make sense" }],
      glosses: { 'i': '나는', 'know': '안다', 'he': '그는', 'says': '말한다', 'the': '그', 'numbers': '숫자들', "don't": '~하지 않는다', 'add': '더하다', 'up': '합쳐지다' },
    },
    {
      id: 's6', start: 15.5, end: 19.3,
      text: "Then let's cut to the chase. Is he bluffing, or is he actually walking?",
      ko: '그럼 본론만 얘기하자. 허세야, 아니면 진짜 떠나는 거야?',
      keyWords: [{ word: 'cut to the chase', ko: '본론으로 들어가다', note: 'get to the main point' }],
      glosses: { 'then': '그럼', "let's": '~하자', 'cut': '자르다', 'to': '~로', 'the': '그', 'chase': '추격', 'is': '~이다', 'he': '그는', 'bluffing': '허세 부리는', 'or': '아니면', 'actually': '사실은', 'walking': '떠나는' },
    },
    {
      id: 's7', start: 20.1, end: 22.3,
      text: "Honestly? I think he's on the fence.",
      ko: '솔직히요? 아직 결정을 못 한 것 같아요.',
      keyWords: [{ word: 'on the fence', ko: '결정을 못 하고 망설이는', note: 'not able to decide' }],
      glosses: { 'honestly': '솔직히', 'i': '나는', 'think': '생각한다', "he's": '그는 ~이다', 'on': '~위에', 'the': '그', 'fence': '울타리' },
    },
    {
      id: 's8', start: 23.3, end: 27.7,
      text: 'Good. On the fence I can work with. Set up a call for ten.',
      ko: '좋아. 망설이는 거라면 해볼 만해. 10시에 통화 잡아.',
      keyWords: [{ word: 'I can work with', ko: '그 정도면 해볼 만하다', note: "it's not perfect, but it's usable" }],
      glosses: { 'good': '좋다', 'on': '~위에', 'the': '그', 'fence': '울타리', 'i': '나는', 'can': '~할 수 있다', 'work': '다루다', 'with': '~와 함께', 'set': '잡다', 'up': '준비해서', 'a': '하나의', 'call': '통화', 'for': '~시로', 'ten': '10(시)' },
    },
    {
      id: 's9', start: 27.9, end: 30.1,
      text: "Already did. I figured you'd wanna jump on it.",
      ko: '벌써 잡았어요. 바로 처리하고 싶어 하실 것 같아서요.',
      keyWords: [{ word: 'jump on it', ko: '바로 착수하다', note: 'deal with it right away' }],
      glosses: { 'already': '이미', 'did': '했다', 'i': '나는', 'figured': '짐작했다', "you'd": '당신이 ~할 것이다', 'wanna': '~하고 싶다', 'jump': '뛰어들다', 'on': '~에', 'it': '그것' },
    },
    {
      id: 's10', start: 30.7, end: 33.6,
      text: "Look at you, one step ahead. What're you gonna tell him?",
      ko: '이것 봐라, 한발 앞서가네. 그 사람한테 뭐라고 할 건데?',
      keyWords: [{ word: 'one step ahead', ko: '한발 앞서 있는', note: 'thinking before others do' }],
      glosses: { 'look': '보다', 'at': '~을', 'you': '너', 'one': '한', 'step': '걸음', 'ahead': '앞서', "what're": '무엇을 ~니', 'gonna': '~할 것이다', 'tell': '말하다', 'him': '그에게' },
    },
    {
      id: 's11', start: 33.9, end: 36.5,
      text: "That if he backs out now, he's leaving money on the table.",
      ko: '지금 발을 빼면 챙길 수 있는 돈을 놓치는 거라고요.',
      keyWords: [
        { word: 'backs out', ko: '발을 빼다', note: 'decide not to do something you agreed to' },
        { word: 'leaving money on the table', ko: '챙길 수 있는 이익을 놓치다', note: 'miss a chance to get more' },
      ],
      glosses: { 'that': '~라는 것', 'if': '만약', 'he': '그가', 'backs': '물러서다', 'out': '밖으로', 'now': '지금', "he's": '그는 ~하고 있다', 'leaving': '남겨두다', 'money': '돈', 'on': '~위에', 'the': '그', 'table': '탁자' },
    },
    {
      id: 's12', start: 36.6, end: 38.0,
      text: "And if he doesn't buy it?",
      ko: '그 말을 안 믿으면?',
      keyWords: [{ word: 'buy it', ko: '그 말을 믿다', note: 'believe it' }],
      glosses: { 'and': '그리고', 'if': '만약', 'he': '그가', "doesn't": '~하지 않으면', 'buy': '믿다(사다)', 'it': '그것을' },
    },
    {
      id: 's13', start: 38.2, end: 41.2,
      text: 'Then we play hardball. Their offer expires Friday.',
      ko: '그럼 세게 나가야죠. 상대 측 제안이 금요일에 만료되거든요.',
      keyWords: [{ word: 'play hardball', ko: '강경하게 나가다', note: 'act tough to get what you want' }],
      glosses: { 'then': '그러면', 'we': '우리는', 'play': '하다', 'hardball': '강경책', 'their': '그들의', 'offer': '제안', 'expires': '만료된다', 'friday': '금요일' },
    },
    {
      id: 's14', start: 41.8, end: 45.5,
      text: "That's a long shot, but it might work. Don't drop the ball on this one.",
      ko: '가능성은 낮지만 통할 수도 있겠네. 이번 건 실수하지 마.',
      keyWords: [
        { word: 'a long shot', ko: '가능성이 낮은 시도', note: 'something unlikely to succeed' },
        { word: 'drop the ball', ko: '실수하다, 일을 망치다', note: 'make a careless mistake' },
      ],
      glosses: { "that's": '그것은 ~이다', 'a': '하나의', 'long': '긴', 'shot': '시도', 'but': '하지만', 'it': '그것은', 'might': '~할지도 모른다', 'work': '통하다', "don't": '~하지 마', 'drop': '떨어뜨리다', 'the': '그', 'ball': '공', 'on': '~에서', 'this': '이', 'one': '건' },
    },
    {
      id: 's15', start: 47.8, end: 49.7,
      text: "I won't. I've got this.",
      ko: '안 해요. 제가 알아서 할게요.',
      keyWords: [{ word: "I've got this", ko: '제가 알아서 할게요', note: 'I can handle it' }],
      glosses: { 'i': '나는', "won't": '~하지 않을 거예요', "i've": '나는 ~가 있다', 'got': '가졌다', 'this': '이것' },
    },
    {
      id: 's16', start: 51.0, end: 54.8,
      text: "I know you do. That's why it's yours. Ten o'clock. Don't be late.",
      ko: '알지. 그래서 네게 맡기는 거야. 10시야. 늦지 마.',
      keyWords: [],
      glosses: { 'i': '나는', 'know': '안다', 'you': '당신은', 'do': '그렇다', "that's": '그것이 ~이다', 'why': '이유', "it's": '그것은 ~이다', 'yours': '네 것', 'ten': '10', "o'clock": '~시', "don't": '~하지 마', 'be': '~이다', 'late': '늦은' },
    },
    {
      id: 's17', start: 55.0, end: 56.6,
      text: "Says the guy who's already late.",
      ko: '이미 늦은 분이 하실 말씀은 아닌데요.',
      keyWords: [{ word: "Says the guy who's", ko: '~인 사람이 할 말은 아니죠', note: "you're one to talk" }],
      glosses: { 'says': '말한다', 'the': '그', 'guy': '남자', "who's": '~인 사람', 'already': '이미', 'late': '늦은' },
    },
    {
      id: 's18', start: 56.7, end: 57.9,
      text: 'Touché.',
      ko: '한 방 먹었네.',
      keyWords: [{ word: 'Touché', ko: '한 방 먹었네', note: 'you got me (good comeback)' }],
      glosses: { 'touché': '한 방 먹었네' },
    },
  ],
};

export default clip;
