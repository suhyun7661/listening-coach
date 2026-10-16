// Sample clip. Sentences are invented practice lines.
// For source "file", videoId will hold the Supabase Storage URL (Stage 13). Placeholder for now.
const clip = {
  id: 'interview-01',
  source: 'file',
  videoId: 'PLACEHOLDER_INTERVIEW_VIDEO_URL',
  title: 'Job interview',
  accent: 'UK',
  difficulty: 5,
  contextKo: '면접관이 지원자에게 경력과 강점에 대해 묻는 장면이에요.',
  sentences: [
    {
      id: 's1', start: 1.0, end: 3.2,
      text: 'Thank you for coming in today.',
      ko: '오늘 와 주셔서 감사합니다.',
      keyWords: [],
      glosses: { thank: '감사하다', coming: '오는', today: '오늘' },
    },
    {
      id: 's2', start: 3.6, end: 6.8,
      text: 'Could you tell me a little about yourself?',
      ko: '본인에 대해 간단히 말씀해 주시겠어요?',
      keyWords: [],
      glosses: { could: '~해 주시겠어요', tell: '말하다', little: '조금', yourself: '당신 자신' },
    },
    {
      id: 's3', start: 7.2, end: 10.6,
      text: "I've been working in marketing for about five years.",
      ko: '저는 마케팅 분야에서 약 5년간 일해 왔습니다.',
      keyWords: [],
      glosses: { working: '일하는', marketing: '마케팅', about: '약', years: '년' },
    },
    {
      id: 's4', start: 11.0, end: 14.0,
      text: 'What would you say is your greatest strength?',
      ko: '본인의 가장 큰 강점이 무엇이라고 생각하세요?',
      keyWords: [],
      glosses: { greatest: '가장 큰', strength: '강점' },
    },
    {
      id: 's5', start: 14.4, end: 17.4,
      text: "I'm very good at working under pressure.",
      ko: '저는 압박 속에서도 일을 잘합니다.',
      keyWords: [{ word: 'under pressure', ko: '압박감 속에서', note: 'Working with stress or tight deadlines' }],
      glosses: { good: '잘하는', working: '일하는' },
    },
    {
      id: 's6', start: 17.8, end: 20.8,
      text: 'Where do you see yourself in five years?',
      ko: '5년 뒤에는 어디에 있을 거라고 보세요?',
      keyWords: [],
      glosses: { where: '어디', see: '보다', years: '년' },
    },
    {
      id: 's7', start: 21.2, end: 24.2,
      text: "I'd like to take on more responsibility.",
      ko: '더 많은 책임을 맡고 싶습니다.',
      keyWords: [{ word: 'take on', ko: '(일·책임을) 맡다', note: 'Accepting a task or responsibility' }],
      glosses: { more: '더 많은', responsibility: '책임' },
    },
    {
      id: 's8', start: 24.6, end: 27.8,
      text: "We'll be in touch by the end of the week.",
      ko: '이번 주말 전까지 연락드리겠습니다.',
      keyWords: [{ word: 'be in touch', ko: '연락하다', note: 'A polite way to say you will contact someone' }],
      glosses: { end: '끝', week: '주' },
    },
  ],
};

export default clip;
